import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.list_item_edit = props => {
	const listName = props?.listName || dom.location.query.get('list');
	const index = props?.index ?? dom.location.query.get('item');

	dom.location.query.set({ view: 'list_item_edit', list: listName, item: index });

	const listItem = props?.listItem || listi.state?.lists?.[listName]?.items?.[index];

	if (index >= 0 && !listItem) return socketClient.reply('list', listName);

	const { summary, description, tags, due, complete } = listItem || {};

	listi.log()('list_item_edit', { listName, index, listItem });

	const listFragment = dom.createFragment();

	const editWrapper = dom.createElem('li', { id: 'edit', className: 'listItem', appendTo: listFragment });

	const summaryInput = dom.createElem('input', { type: 'text', value: summary || '', appendTo: dom.createElem('label', { textContent: 'Summary', appendTo: editWrapper }) });
	const descriptionInput = dom.createElem('textarea', { value: description || '', appendTo: dom.createElem('label', { textContent: 'Description', appendTo: editWrapper }) });

	const tagList = listi.createTagList(tags);
	const tagAdd = dom.createElem('button', {
		id: 'tagAdd',
		onPointerPress: () => {
			const tags = Array.from(tagList.children).map(elem => elem.textContent);

			if (tagInput.value.length < 2 || tags.includes(tagInput.value)) return;

			tagList.appendChild(listi.createTag(tagInput.value));

			tagAdd.parentElement.classList.remove('showTagAdd');

			tagInput.value = '';
		},
	});
	const tagInput = dom.createElem('input', {
		type: 'text',
		placeholder: 'Add new tags',
		onKeyUp: () => tagAdd.parentElement.classList[tagInput.value.length > 1 ? 'add' : 'remove']('showTagAdd'),
	});

	dom.createElem('label', { textContent: 'Tags', appendChildren: [tagInput, tagAdd, tagList], appendTo: editWrapper });

	dom.createElem('label', { textContent: 'Due Date', appendTo: editWrapper });

	dom.createElem('button', {
		textContent: due || 'Set',
		className: 'dueDate postLabel',
		appendTo: editWrapper,
		onPointerPress: () => listi.draw('list_item_set_due_date', { index, listName, listItem: buildListItemDocument() }),
	});

	const completeAction = dom.createElem('select', {
		appendTo: dom.createElem('label', { textContent: 'Complete Action', appendTo: editWrapper }),
		options: ['Add Tag', 'Remove Tag', 'Toggle Tag', 'Delete', 'Reschedule'],
		value: complete?.action || 'Add Tag',
		onChange: evt => {
			dom[evt.value.includes('Tag') ? 'show' : 'disappear'](tagContainer);
			dom[evt.value === 'Reschedule' ? 'show' : 'disappear'](schedulingContainer);
		},
	});

	const tagContainer = dom.createElem('div', { className: !complete?.action || complete?.action?.includes('Tag') ? 'show' : 'disappear', appendTo: editWrapper });
	const schedulingContainer = dom.createElem('div', { className: complete?.action === 'Reschedule' ? 'show' : 'disappear', appendTo: editWrapper });
	editWrapper.appendChild(schedulingContainer);

	const tagName = dom.createElem('input', {
		type: 'text',
		value: complete?.tagName || 'Complete',
		appendTo: dom.createElem('label', { textContent: 'Tag Name', placeholder: 'Complete', appendTo: tagContainer }),
	});

	const rescheduleUnit = dom.createElem('select', {
		appendTo: dom.createElem('label', { textContent: 'Unit', appendTo: schedulingContainer }),
		options: ['Day', 'Week', 'Month', 'Year'],
		value: complete?.unit || 'Day',
	});

	const rescheduleFrequency = dom.createElem('input', {
		type: 'number',
		value: complete?.frequency || 1,
		appendTo: dom.createElem('label', { textContent: 'How Many Units After', appendTo: schedulingContainer }),
	});
	const rescheduleCount = dom.createElem('input', {
		type: 'number',
		value: complete?.count,
		placeholder: 'Infinity',
		appendTo: dom.createElem('label', { textContent: 'How Many Times To Reschedule', appendTo: schedulingContainer }),
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
					count: rescheduleCount.value,
					unit: rescheduleUnit.value,
					frequency: rescheduleFrequency.value,
					gap: oneDay * unitMultipliers[rescheduleUnit.value] * rescheduleFrequency.value,
				}),
			},
			// repeat: waitMs
		};
	};

	listi.save = () => {
		socketClient.reply('list_item_edit', { index, listName, listItem: buildListItemDocument() });
	};

	const toolbar = [
		{ id: 'lists', onPointerPress: () => listi.draw('list', listName) },
		{ id: 'save', onPointerPress: listi.save },
		{ type: 'h1', textContent: `${summary ? 'Edit' : 'Create new'} list item` },
	];

	if (summary) {
		toolbar.splice(toolbar.length - 1, 0, {
			id: 'delete',
			onPointerPress: () => {
				socketClient.reply('list_item_edit', { index, listName, remove: true });
			},
		});
	}

	listi.drawToolkit(toolbar);

	dom.getElemById('list').appendChild(listFragment);

	summaryInput.select();
};
