import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.list_item_edit = function(item = {}){
	listi.log()(item);

	var listFragment = dom.createFragment();

	var editWrapper = dom.createElem('li', { id: 'edit', className: 'listItem', appendTo: listFragment });

	var summaryInput = dom.createElem('input', { type: 'text', value: item.summary || '', appendTo: dom.createElem('label', { textContent: 'Summary', appendTo: editWrapper }) });
	var descriptionInput = dom.createElem('textarea', { value: item.description || '', appendTo: dom.createElem('label', { textContent: 'Description', appendTo: editWrapper }) });

	var tagList = listi.createTagList(item.tags);
	var tagAdd = dom.createElem('button', {
		id: 'tagAdd',
		onPointerPress: () => {
			if(tagInput.value.length < 2 || Array.from(tagList.children).map((elem) => { return elem.textContent; }).includes(tagInput.value)) return;

			tagList.appendChild(listi.createTag(tagInput.value));

			tagAdd.parentElement.classList.remove('showTagAdd');

			tagInput.value = '';
		}
	});
	var tagInput = dom.createElem('input', {
		type: 'text',
		placeholder: 'Add new tags',
		onKeyUp: () => {
			tagAdd.parentElement.classList[tagInput.value.length > 1 ? 'add' : 'remove']('showTagAdd');
		}
	});

	dom.createElem('label', { textContent: 'Tags', appendChildren: [tagInput, tagAdd, tagList], appendTo: editWrapper });

	const completeAction = dom.createElem('select', { appendTo: dom.createElem('label', { textContent: 'Complete Action', appendTo: editWrapper }) });

	['Add Tag', 'Delete'].forEach((option) => {
		dom.createElem('option', { appendTo: completeAction, textContent: option });
	});

	dom.createElem('label', { textContent: 'Due Date', appendTo: editWrapper });

	var dueDate = dom.createElem('button', {
		textContent: item.due ? (item.due instanceof Array ? item.due.join(' - ') : item.due) : 'Set',
		className: 'dueDate postLabel',
		appendTo: editWrapper,
		onPointerPress: () => {
			listi.draw('list_item_set_due_date', {
				index: item.index,
				listName: item.listName,
				summary: summaryInput.value,
				description: descriptionInput.value,
				tags: Array.from(tagList.children).map((elem) => { return elem.textContent; })
			});
		}
	});

	if(item.due){
		dom.createElem('label', { textContent: 'Recurring', appendTo: editWrapper });

		const recurringRadioPress = ({ target }) => {
			if(target.classList.contains('pressed')) return;

			Array.from(target.parentElement.children).forEach((elem, index) => {
				if(elem === target) target.parentElement.setAttribute('data-radioValue', index);

				elem.classList[elem === target ? 'add' : 'remove']('pressed');
			});
		};

		dom.createElem('div', {
			id: 'recurringRadio',
			className: 'postLabel',
			appendChildren: [
				dom.createElem('button', { textContent: 'Off', className: !item.recurring || item.recurring === 'off' ? 'pressed' : '', onPointerPress: recurringRadioPress }),
				dom.createElem('button', { textContent: 'Absolute', className: item.recurring === 'absolute' ? 'pressed' : '', onPointerPress: recurringRadioPress }),
				dom.createElem('button', { textContent: 'Relative', className: item.recurring === 'relative' ? 'pressed' : '', onPointerPress: recurringRadioPress })
			],
			appendTo: editWrapper
		});

		//todo absolute configuration: interval (X days from last due date), count (how many times to reschedule? X - Infinity)

		//todo relative configuration: delay (X days from last completion), due window (X days long window to complete), count (how many times to reschedule? X - Infinity)

		//todo maybe absolute is the only recurring option with a single date, and relative is the only option when using a range?
	}

	//todo linked list, complete action

	listi.save = () => {
		socketClient.reply('list_item_edit', {
			index: item.index,
			listName: item.listName,
			new: {
				summary: summaryInput.value,
				description: descriptionInput.value,
				tags: Array.from(tagList.children).map((elem) => { return elem.textContent; }),
				due: dueDate.textContent === 'Set' ? undefined : dueDate.textContent.split(' - '),
				recurring: item.due ? ['off', 'absolute', 'relative'][document.getElementById('recurringRadio').getAttribute('data-radioValue')] : false
			}
		});
	};

	var toolkit = [
		{ id: 'lists', onPointerPress: socketClient.reply.bind(this, 'list', item.listName) },
		{ id: 'save', onPointerPress: listi.save.bind(this) },
		{ type: 'div', textContent: `${item.summary ? 'Edit' : 'Create new'} list item` }
	];

	if(item.summary){
		toolkit.splice(toolkit.length - 1, 0, {
			id: 'delete',
			onPointerPress: () => {
				socketClient.reply('list_item_edit', { index: item.index, listName: item.listName, delete: true });
			}
		});
	}

	listi.drawToolkit(toolkit);

	dom.getElemById('list').appendChild(listFragment);

	summaryInput.select();
};