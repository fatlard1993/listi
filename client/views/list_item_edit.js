import '../styles/list_item_edit.css';

import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../listi';
import Toolbar from '../components/Toolbar';
import TagList from '../components/TagList';
import Tag from '../components/Tag';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import LabeledElement from '../components/LabeledElement';
import EditForm from '../components/EditForm';

export default props => {
	const listName = props?.listName || dom.location.query.get('list');
	const index = props?.index ?? dom.location.query.get('item');

	dom.location.query.set({ view: 'list_item_edit', list: listName, item: index });

	const listItem = props?.listItem || listi.state?.lists?.[listName]?.items?.[index];

	if (index >= 0 && !listItem) return listi.draw('lists');

	const { summary, description, tags, due, complete } = listItem || {};

	listi.log()('list_item_edit', { listName, index, listItem });

	const appendTo = dom.getElemById('app');

	listi.save = () => {
		dom.location.query.set({ view: 'list', list: listName });

		socketClient.reply('list_item_edit', { index, listName, update: buildListItemDocument() });
	};

	const toolbarItems = [
		new Button({ id: 'back', onPointerPress: () => listi.draw('list', listName) }),
		new PageHeader({ textContent: `${summary ? 'Edit' : 'Create new'} list item` }),
		new Button({ id: 'save', className: 'right', onPointerPress: listi.save }),
	];

	if (summary) {
		toolbarItems.push(
			new Button({
				id: 'delete',
				className: 'right',
				onPointerPress: () => {
					dom.location.query.set({ view: 'list', list: listName });

					socketClient.reply('list_item_edit', { index, listName, remove: true });
				},
			}),
		);
	}

	new Toolbar({
		appendTo,
		appendChildren: toolbarItems,
	});

	const summaryInput = new LabeledElement('input', { type: 'text', value: summary || '', label: 'Summary' });
	const descriptionInput = new LabeledElement('textarea', { value: description || '', label: 'Description' });

	const tagList = new TagList({ items: tags });
	const tagAdd = new Button({
		id: 'tagAdd',
		onPointerPress: () => {
			const tags = Array.from(tagList.children).map(elem => elem.textContent);

			if (tagInput.value.length < 2 || tags.includes(tagInput.value)) return;

			new Tag({ appendTo: tagList, name: tagInput.value });

			tagAdd.parentElement.classList.remove('showTagAdd');

			tagInput.value = '';
		},
	});
	const tagInput = dom.createElem('input', {
		type: 'text',
		placeholder: 'Add new tags',
		onKeyUp: () => tagAdd.parentElement.classList[tagInput.value.length > 1 ? 'add' : 'remove']('showTagAdd'),
	});

	const completeAction = new LabeledElement('select', {
		label: 'Complete Action',
		options: ['Add Tag', 'Remove Tag', 'Toggle Tag', 'Delete', 'Reschedule'],
		value: complete?.action || 'Add Tag',
		onChange: evt => {
			dom[evt.value.includes('Tag') ? 'show' : 'disappear'](tagContainer);
			dom[evt.value === 'Reschedule' ? 'show' : 'disappear'](schedulingContainer);
		},
	});

	const tagContainer = dom.createElem('div', { className: !complete?.action || complete?.action?.includes('Tag') ? 'show' : 'disappear' });
	const schedulingContainer = dom.createElem('div', { className: complete?.action === 'Reschedule' ? 'show' : 'disappear' });

	const tagName = new LabeledElement('input', {
		type: 'text',
		label: 'Tag Name',
		value: complete?.tagName || 'Complete',
		appendTo: tagContainer,
	});

	const rescheduleBase = new LabeledElement('select', {
		label: 'Date Base',
		options: ['Last Due', 'Last Completed'],
		value: complete?.base || 'Last Due',
		appendTo: schedulingContainer,
	});

	const rescheduleUnit = new LabeledElement('select', {
		label: 'Unit',
		options: ['Day', 'Week', 'Month', 'Year'],
		value: complete?.unit || 'Day',
		appendTo: schedulingContainer,
	});

	const rescheduleFrequency = new LabeledElement('input', {
		type: 'number',
		label: 'How Many Units After',
		value: complete?.frequency || 1,
		appendTo: schedulingContainer,
	});
	const rescheduleCount = new LabeledElement('input', {
		type: 'number',
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

	const buildListItemDocument = () => {
		return {
			summary: summaryInput.value,
			description: descriptionInput.value,
			tags: Array.from(tagList.children).map(elem => {
				return elem.textContent;
			}),
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

	new EditForm({
		appendTo,
		appendChildren: [
			summaryInput.parentElem,
			descriptionInput.parentElem,
			dom.createElem('label', { textContent: 'Tags', appendChildren: [tagInput, tagAdd, tagList] }),
			dom.createElem('label', { textContent: 'Due Date' }),
			new Button({
				textContent: due || 'Set',
				className: 'dueDate postLabel',
				onPointerPress: () => listi.draw('list_item_set_due_date', { index, listName, listItem: buildListItemDocument() }),
			}),
			completeAction.parentElem,
			tagContainer,
			schedulingContainer,
		],
	});

	summaryInput.select();
};
