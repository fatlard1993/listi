import './index.css';

import dom from 'dom';
import { jsUtil } from 'js-util';
import socketClient from 'socket-client';

import router from '../../../router';

import { Toolbar, Content } from '../../layout';
import { Textarea, Select, Button, IconButton } from '../../inputs';
import TagList from '../../TagList';
import PageHeader from '../../PageHeader';
import ModalDialog from '../../dialogs/ModalDialog';
import Label from '../../Label';
import LabeledTextInput from '../../LabeledTextInput';
import LabeledNumberInput from '../../LabeledNumberInput';
import DomElem from '../../DomElem';
import UnloadAwareView from '../UnloadAwareView';
import BeforePageChangeDialog from '../../dialogs/BeforePageChangeDialog';

export class ItemEdit extends UnloadAwareView {
	constructor({ className, serverState, ...rest }) {
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
		const { summary, description, tags, due, complete } = serverState.items[id] || {};

		if (!summary && id !== 'new') {
			router.path = router.ROUTES.filters;

			return;
		}

		const dirtyChecks = [];
		const isDirty = () => dirtyChecks.every(isDirty => (typeof isDirty === 'function' ? isDirty() : true));

		super.render({
			className: ['itemEdit', className],
			isDirty,
			...rest,
		});

		const appendTo = this.elem;

		const handleSave = () => {
			socketClient.reply('item_edit', { id, update: buildDocument() });

			router.path = router.buildPath(router.ROUTES.list);
		};

		const toolbarItems = [
			new IconButton({
				icon: 'arrow-left',
				onPointerPress: () => {
					new BeforePageChangeDialog({
						isDirty,
						appendTo,
						onYes: () => {
							router.path = router.buildPath(router.ROUTES.list);
						},
					});
				},
			}),
			new PageHeader({ textContent: `${summary ? 'Edit' : 'Create New'} Item` }),
			new IconButton({ icon: 'save', className: 'right', onPointerPress: handleSave }),
		];

		if (summary) {
			toolbarItems.push(
				new IconButton({
					icon: 'trash-alt',
					className: 'right',
					onPointerPress: () => {
						new ModalDialog({
							appendTo,
							header: 'Attention',
							content: 'Are you sure you want to delete this item?',
							buttons: ['yes', 'no'],
							onDismiss: ({ button, closeDialog }) => {
								if (button === 'yes') {
									socketClient.reply('item_edit', { id, remove: true });

									router.path = router.buildPath(router.ROUTES.list);
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

		const { textInput: summaryInput, label: summaryLabel } = new LabeledTextInput({ label: 'Summary', value: summary || '' });
		// const { textarea: descriptionInput, label: descriptionLabel } = new LabeledTextarea('textarea', { value: description || '', label: 'Description' });
		const descriptionInput = new Textarea({ value: description || '', label: 'Description' });

		const tagList = new TagList({ tags, readOnly: false });

		const completeAction = new Select({
			options: ['Add Tag', 'Remove Tag', 'Toggle Tag', 'Delete', 'Reschedule'],
			value: complete?.action || 'Add Tag',
			onChange: evt => {
				dom[evt.value.includes('Tag') ? 'show' : 'disappear'](tagContainer);
				dom[evt.value === 'Reschedule' ? 'show' : 'disappear'](schedulingContainer);
			},
		});

		const tagContainer = new DomElem('div', { className: !complete?.action || complete?.action?.includes('Tag') ? 'show' : 'disappear' });
		const schedulingContainer = new DomElem('div', { className: complete?.action === 'Reschedule' ? 'show' : 'disappear' });

		const { textInput: tagName } = new LabeledTextInput({
			label: 'Tag Name',
			value: complete?.tagName || 'Complete',
			appendTo: tagContainer,
		});

		const rescheduleBase = new Select({
			options: ['Last Due', 'Last Completed'],
			value: complete?.base || 'Last Due',
		});

		new Label({
			label: 'Date Base',
			appendChild: rescheduleBase,
			appendTo: schedulingContainer,
		});

		const rescheduleUnit = new Select({
			options: ['Day', 'Week', 'Month', 'Year'],
			value: complete?.unit || 'Day',
		});

		new Label({
			label: 'Unit',
			appendChild: rescheduleUnit,
			appendTo: schedulingContainer,
		});

		const { numberInput: rescheduleFrequency } = new LabeledNumberInput({
			label: 'How Many Units After',
			value: complete?.frequency || 1,
			appendTo: schedulingContainer,
		});
		const { numberInput: rescheduleCount } = new LabeledNumberInput({
			label: 'How Many Times To Reschedule',
			placeholder: 'Infinity',
			value: complete?.count,
			appendTo: schedulingContainer,
		});

		// todo add choice for reschedule: base from last due or completion date
		// todo linked list

		// todo better time gap creation (consider leap years and months with differing days)
		const oneDay = 1000 * 60 * 60 * 24;
		const unitMultipliers = {
			Day: 1,
			Week: 7,
			Month: 30,
			Year: 365,
		};

		dirtyChecks.push(
			summaryInput.isDirty,
			descriptionInput.isDirty,
			() =>
				!jsUtil.sameArr(
					Array.from(tagList.children).map(({ textContent }) => textContent),
					tags,
				),
			() => complete?.action || 'Add Tag' !== completeAction.value,
			tagName.isDirty,
			rescheduleFrequency.isDirty,
			rescheduleCount.isDirty,
			() => complete?.base || 'Last Due' !== rescheduleBase.value,
			() => complete?.unit || 'Day' !== rescheduleUnit.value,
		);

		const buildDocument = () => {
			return {
				summary: summaryInput.value,
				description: descriptionInput.value,
				tags: Array.from(tagList.children)
					.filter(({ className }) => !className.includes('addTag'))
					.map(({ textContent }) => textContent),
				due,
				complete: {
					action: completeAction.value,
					...(completeAction.value.includes('Tag') && { tagName: tagName.value }),
					...(completeAction.value === 'Reschedule' && {
						base: rescheduleBase.value,
						count: rescheduleCount.value,
						unit: rescheduleUnit.value,
						frequency: rescheduleFrequency.value,
						gap: oneDay * unitMultipliers[rescheduleUnit.value] * rescheduleFrequency.value,
					}),
				},
				// repeat: waitMs
			};
		};

		new Content({
			appendTo,
			appendChildren: [
				summaryLabel,
				new Label({ label: 'Description', appendChild: descriptionInput }),
				new Label({ label: 'Tags', appendChild: tagList }),
				new Label({
					label: 'Due Date',
					appendChild: new Button({
						textContent: due || 'Set',
						className: 'dueDate postLabel',
						onPointerPress: () => {
							router.path = router.routeToPath(router.ROUTES.itemSchedule, { id, item: buildDocument() });
						},
					}),
				}),
				new Label({ label: 'Complete Action', appendChildren: [completeAction, tagContainer, schedulingContainer] }),
			],
		});

		socketClient.on('item_edit', ({ success, error }) => {
			if (success) {
				router.path = router.ROUTES.filters;

				return;
			}

			console.error()(error);
		});

		summaryInput.select();
	}

	cleanup() {
		socketClient.clearEventListeners();

		super.cleanup();
	}
}
