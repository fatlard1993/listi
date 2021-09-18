import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.list = function ({ name, items } = {}) {
	if (!items) return listi.log.error()(`No current selected list`);

	listi.log()('draw_list', name, items);

	var listFragment = dom.createFragment();

	listi.drawToolkit([
		{ id: 'lists', onPointerPress: socketClient.reply.bind(this, 'lists') },
		{ id: 'calendar', onPointerPress: listi.draw.bind(this, 'list_calendar', items) },
		{ id: 'add', onPointerPress: listi.draw.bind(this, 'list_item_edit', { listName: name }) },
		{ id: 'filter', onPointerPress: listi.draw.bind(this, 'filter_edit', items) },
		{ type: 'div', textContent: name },
		{ id: 'edit', onPointerPress: listi.draw.bind(this, 'list_edit', { name }) },
	]);

	if (!items.length) {
		return dom.createElem('li', { textContent: 'No list items yet .. Create some with the + button above', appendTo: dom.getElemById('list') });
	}

	items.forEach((item, index) => {
		var tagList = listi.createTagList(item.tags);
		tagList.classList.add('displayOnly');

		dom.createElem('li', {
			textContent: item.summary,
			className: 'listItem',
			appendChildren: [
				dom.createElem('button', {
					className: 'edit',
					onPointerPress: () => {
						listi.draw('list_item_edit', Object.assign({ index, listName: name }, item));
					},
				}),
				dom.createElem('div', { textContent: item.description, className: 'description' }),
				dom.createElem('div', { textContent: `Due: ${item.due}`, className: 'dueDate' }),
				tagList,
			],
			appendTo: listFragment,
			onPointerPressAndHold: () => {
				item.tags = item.tags || [];

				item.tags.push('completed');

				socketClient.reply('list_item_edit', { index, listName: name, new: item });
			},
		});
	});

	dom.getElemById('list').appendChild(listFragment);
};
