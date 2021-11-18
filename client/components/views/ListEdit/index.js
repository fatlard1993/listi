import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../../../listi';

import Toolbar from '../../Toolbar';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import EditForm from '../../EditForm';
import LabeledTextInput from '../../LabeledTextInput';
import ModalDialog from '../../ModalDialog';
import UnloadAwareView from '../UnloadAwareView';
import BeforePageChangeDialog from '../../BeforePageChangeDialog';

export default class ListEdit extends UnloadAwareView {
	constructor({ listName = dom.location.query.get('listName') || '', className, ...rest }) {
		super({
			className: ['listEdit', className],
			isDirty: () => textInput.isDirty(),
			...rest,
		});

		const appendTo = this.elem;
		const { log, load, checkDisabledPointer } = listi;

		const { label: nameLabel, textInput } = new LabeledTextInput({ label: 'Name', value: listName });

		listi.save = () => {
			socketClient.reply('list_edit', { listName, update: { name: textInput.value } });

			load(listName ? 'SingleList' : 'Lists', { listName });
		};

		const toolbarItems = [
			new IconButton({
				icon: 'back',
				onPointerPress: evt =>
					checkDisabledPointer(evt, () => {
						new BeforePageChangeDialog({
							isDirty: () => textInput.isDirty(),
							appendTo,
							onYes: () => load(listName ? 'SingleList' : 'Lists', { listName }),
						});
					}),
			}),
			new PageHeader({ textContent: `${listName ? 'Edit' : 'Create new'} list` }),
			new IconButton({ icon: 'save', className: 'right', onPointerPress: evt => checkDisabledPointer(evt, listi.save) }),
		];

		if (listName) {
			toolbarItems.push(
				new IconButton({
					icon: 'delete',
					className: 'right',
					onPointerPress: evt =>
						checkDisabledPointer(evt, () => {
							new ModalDialog({
								appendTo,
								header: 'Attention',
								content: 'Are you sure you want to delete this list?',
								buttons: ['yes', 'no'],
								onDismiss: ({ button, closeDialog }) => {
									if (button === 'yes') {
										socketClient.reply('list_edit', { listName, remove: true });

										load('Lists', {});
									}

									closeDialog();
								},
							});
						}),
				}),
			);
		}

		new Toolbar({
			appendTo,
			appendChildren: toolbarItems,
		});

		new EditForm({ appendTo, appendChildren: [nameLabel] });

		socketClient.on('list_edit', ({ success, error }) => {
			if (success) return listi.draw('Lists');

			log.error()(error);
		});

		textInput.select();
	}

	cleanup() {
		socketClient.clearEventListeners();

		dom.location.query.delete('listName');

		super.cleanup();
	}
}
