import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.list = name => {
	name = name || dom.location.query.get('list');

	const list = listi.state?.lists?.[name];

	dom.location.query.set({ view: 'list', list: name });

	if (!list) return socketClient.reply('lists', name);

	const { items, filter } = list;

	if (!items) {
		listi.log.error()(`No current selected list`);

		listi.draw('lists');

		return;
	}

	listi.log()('list', name, items, filter);

	const listFragment = dom.createFragment();

	listi.drawToolkit([
		{ id: 'lists', onPointerPress: () => listi.draw('lists') },
		{ id: 'calendar', onPointerPress: () => listi.draw('list_calendar', name) },
		{ id: 'filter', onPointerPress: () => listi.draw('list_filter', name) },
		{ id: 'edit', onPointerPress: () => listi.draw('list_edit', name) },
		{ type: 'h1', textContent: name },
		{ id: 'add', className: 'right', onPointerPress: () => listi.draw('list_item_edit', { listName: name }) },
	]);

	if (!items.length) {
		return dom.createElem('li', { textContent: 'No list items yet .. Create some with the + button above', appendTo: dom.getElemById('list') });
	}

	items.forEach((item, index) => {
		const tagList = listi.createTagList(item.tags);
		tagList.classList.add('readOnly');

		const dueWrapper = dom.createElem('div');
		let overdue;
		let dueSoon;

		if (item.due) {
			const dueDateDiff = listi.dayDiff(item.due);

			overdue = dueDateDiff < 0;
			dueSoon = !overdue && dueDateDiff < 7;

			dom.createElem('div', { textContent: `${overdue ? '(Overdue) ' : ''}Due: ${listi.dayCountName(dueDateDiff)} (${item.due})`, className: 'dueDate', appendTo: dueWrapper });
		}

		const handleComplete = () => {
			let action = item.complete?.action;
			const now = new Date();
			const lastDue = item.due;

			listi.log('Complete', item);

			if (action === 'Delete') return socketClient.reply('list_item_edit', { index, listName: name, remove: true });

			item.lastComplete = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
			item.due = '';

			if (action.includes('Tag')) {
				item.tags = item.tags || [];

				const tagName = item.complete.tagName || 'Complete';
				action = action === 'Toggle Tag' ? (item.tags.includes(tagName) ? 'Remove Tag' : 'Add Tag') : action;

				if (action === 'Add Tag' && !item.tags.includes(tagName)) item.tags.push(tagName);
				else if (action === 'Remove Tag' && item.tags.includes(tagName)) item.tags.splice(item.tags.indexOf(tagName), 1);
			} else if (action === 'Reschedule') {
				let nextDue = new Date((item.complete.base === 'Last Completed' && item.lastComplete ? new Date(item.lastComplete) : new Date(lastDue)).getTime() + item.complete.gap);

				nextDue = `${nextDue.getMonth() + 1}/${nextDue.getDate()}/${nextDue.getFullYear()}`;

				item.due = nextDue;
			}

			socketClient.reply('list_item_edit', { index, listName: name, update: item });
		};

		dom.createElem('li', {
			textContent: item.summary,
			className: `listItem${overdue ? ' overdue' : dueSoon ? ' dueSoon' : ''}`,
			appendChildren: [
				dom.createElem('button', {
					className: 'edit',
					onPointerPress: () => {
						listi.draw('list_item_edit', { index, listName: name });
					},
				}),
				dom.createElem('button', {
					className: 'complete',
					onPointerPress: handleComplete,
				}),
				dom.createElem('div', { textContent: item.description, className: 'description' }),
				dueWrapper,
				tagList,
			],
			appendTo: listFragment,
		});
	});

	dom.getElemById('list').appendChild(listFragment);
};
