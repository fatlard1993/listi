import dom from 'dom';
import socketClient from 'socket-client';

import router from '../../../router';

import Toolbar from '../../Toolbar';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import LabeledTextInput from '../../LabeledTextInput';
import ModalDialog from '../../ModalDialog';
import Content from '../../Content';
import UnloadAwareView from '../UnloadAwareView';
import BeforePageChangeDialog from '../../BeforePageChangeDialog';

export default class FilterEdit extends UnloadAwareView {
	constructor({ className, state: serverState, ...rest }) {
		super();

		this.options = { className, ...rest };

		socketClient.on('state', newState => this.render({ className, serverState: newState, ...rest }));

		this.render({ className, serverState, ...rest });
	}

	render({ className, serverState, ...rest }) {
		if (!serverState) {
			socketClient.reply('request_state', true);

			return undefined;
		}

		const { id } = router.parseRouteParams();
		const { name, tag } = serverState.filters[id] || {};

		if (!name && id !== 'new') {
			router.path = router.ROUTES.filters;

			return;
		}

		const isDirty = () => (saved ? false : nameInput.isDirty() && tagInput.isDirty());

		super.render({
			className: ['filterEdit', className],
			isDirty,
			...rest,
		});

		const appendTo = this.elem;
		let saved = false;

		const { label: nameLabel, textInput: nameInput } = new LabeledTextInput({ label: 'Name', value: name });
		const { label: tagLabel, textInput: tagInput } = new LabeledTextInput({ label: 'Tag', value: tag });

		const handleSave = () => {
			socketClient.reply('filter_edit', { filterId: id, update: { name: nameInput.value, tag: tagInput.value } });
		};

		socketClient.on('filter_edit', ({ success, error }) => {
			if (success) {
				saved = true;
				router.path = router.ROUTES.filter;

				return;
			}

			console.log(error);

			router.path = router.ROUTES.filter;
		});

		dom.interact.on('keyUp', ({ keyPressed }) => {
			if (keyPressed === 'ENTER') handleSave();
		});

		const toolbarItems = [
			new IconButton({
				icon: 'arrow-left',
				onPointerPress: () => {
					new BeforePageChangeDialog({
						isDirty,
						appendTo,
						onYes: () => {
							router.path = name ? router.ROUTES.filters : router.routeToPath(router.ROUTES.list, { filterId: id });
						},
					});
				},
			}),
			new PageHeader({ textContent: `${name ? 'Edit' : 'Create New'} Filter` }),
			new IconButton({ icon: 'save', className: 'right', onPointerPress: handleSave }),
		];

		if (name) {
			toolbarItems.push(
				new IconButton({
					icon: 'trash-alt',
					className: 'right',
					onPointerPress: () => {
						new ModalDialog({
							appendTo,
							header: 'Attention',
							content: 'Are you sure you want to delete this filter?',
							buttons: ['yes', 'no'],
							onDismiss: ({ button, closeDialog }) => {
								if (button === 'yes') {
									socketClient.reply('filter_edit', { filterId: id, remove: true });

									router.path = router.ROUTES.filters;
								}

								closeDialog();
							},
						});
					},
				}),
			);
		}

		new Toolbar({
			appendTo,
			appendChildren: toolbarItems,
		});

		new Content({ appendTo, appendChildren: [nameLabel, tagLabel] });

		nameInput.select();
	}

	cleanup() {
		socketClient.clearEventListeners();

		super.cleanup();
	}
}