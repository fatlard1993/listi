import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.list_item_edit = function ({ summary, description, tags, due, index, listName } = {}) {
	listi.log()({ summary, description, tags, due, index, listName });

	const listFragment = dom.createFragment();

	const editWrapper = dom.createElem('li', { id: 'edit', className: 'listItem', appendTo: listFragment });

	const summaryInput = dom.createElem('input', { type: 'text', value: summary || '', appendTo: dom.createElem('label', { textContent: 'Summary', appendTo: editWrapper }) });
	const descriptionInput = dom.createElem('textarea', { value: description || '', appendTo: dom.createElem('label', { textContent: 'Description', appendTo: editWrapper }) });

	const tagList = listi.createTagList(tags);
	const tagAdd = dom.createElem('button', {
		id: 'tagAdd',
		onPointerPress: () => {
			if (
				tagInput.value.length < 2 ||
				Array.from(tagList.children)
					.map(elem => {
						return elem.textContent;
					})
					.includes(tagInput.value)
			)
				return;

			tagList.appendChild(listi.createTag(tagInput.value));

			tagAdd.parentElement.classList.remove('showTagAdd');

			tagInput.value = '';
		},
	});
	const tagInput = dom.createElem('input', {
		type: 'text',
		placeholder: 'Add new tags',
		onKeyUp: () => {
			tagAdd.parentElement.classList[tagInput.value.length > 1 ? 'add' : 'remove']('showTagAdd');
		},
	});

	dom.createElem('label', { textContent: 'Tags', appendChildren: [tagInput, tagAdd, tagList], appendTo: editWrapper });

	dom.createElem('label', { textContent: 'Due Date', appendTo: editWrapper });

	const dueDate = dom.createElem('button', {
		textContent: due ? (due instanceof Array ? due.join(' - ') : due) : 'Set',
		className: 'dueDate postLabel',
		appendTo: editWrapper,
		onPointerPress: () => {
			listi.draw('list_item_set_due_date', {
				index,
				listName,
				summary: summaryInput.value,
				description: descriptionInput.value,
				tags: Array.from(tagList.children).map(elem => {
					return elem.textContent;
				}),
			});
		},
	});

	const schedulingContainer = dom.createElem('div', { className: 'disappear' });

	const completeAction = dom.createElem('select', {
		appendTo: dom.createElem('label', { textContent: 'Complete Action', appendTo: editWrapper }),
		options: ['Add Tag', 'Delete', 'Reschedule'],
		onChange: evt => {
			dom[evt.value === 'Reschedule' ? 'show' : 'disappear'](schedulingContainer);
		},
	});

	editWrapper.appendChild(schedulingContainer);

	// const rescheduleFrom = dom.createElem('select', {
	// 	appendTo: dom.createElem('label', { textContent: 'Reschedule From', appendTo: schedulingContainer }),
	// 	options: ['Completion Date', 'Last Due Date'],
	// });

	// const rescheduleDays = dom.createElem('input', { type: 'number', value: 7, appendTo: dom.createElem('label', { textContent: 'How Many Days After', appendTo: schedulingContainer }) });
	// const rescheduleTimes = dom.createElem('input', {
	// 	type: 'number',
	// 	placeholder: 'Infinity',
	// 	appendTo: dom.createElem('label', { textContent: 'How Many Times To Reschedule', appendTo: schedulingContainer }),
	// });

	//todo linked list

	listi.save = () => {
		socketClient.reply('list_item_edit', {
			index: index,
			listName: listName,
			new: {
				summary: summaryInput.value,
				description: descriptionInput.value,
				tags: Array.from(tagList.children).map(elem => {
					return elem.textContent;
				}),
				due: dueDate.textContent === 'Set' ? undefined : dueDate.textContent.split(' - '),
				complete: {
					action: completeAction.value,
					// type
					// nextDue
				},
				// repeat: waitMs
			},
		});
	};

	const toolkit = [
		{ id: 'lists', onPointerPress: socketClient.reply.bind(this, 'list', listName) },
		{ id: 'save', onPointerPress: listi.save.bind(this) },
		{ type: 'div', textContent: `${summary ? 'Edit' : 'Create new'} list item` },
	];

	if (summary) {
		toolkit.splice(toolkit.length - 1, 0, {
			id: 'delete',
			onPointerPress: () => {
				socketClient.reply('list_item_edit', { index: index, listName: listName, remove: true });
			},
		});
	}

	listi.drawToolkit(toolkit);

	dom.getElemById('list').appendChild(listFragment);

	summaryInput.select();
};
