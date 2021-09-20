import dom from 'dom';
import socketClient from 'socket-client';
import Calendar from 'calendar';

import listi from 'listi';

listi.views.list_calendar = name => {
	const list = listi.state.lists[name] || {};

	const listFragment = dom.createFragment();

	listi.drawToolkit([{ id: 'lists', onPointerPress: () => socketClient.reply('list', name) }]);

	listi.calendar = new Calendar();

	list.items.forEach((item, index) => {
		if (item.due) listi.calendar.addEvent({ index, label: item.summary, at: item.due });
	});

	listi.calendar.on('selectDay', evt => {
		listi.draw('list_item_edit', { listName: name, listItem: { due: evt.fullDate } });
	});

	listi.calendar.on('selectEvent', evt => {
		listi.draw('list_item_edit', { index: evt.index, listName: name });
	});

	dom.getElemById('toolkit').appendChild(listi.calendar.title);

	listi.calendar.render();

	listFragment.appendChild(dom.createElem('li', { id: 'calendar', className: 'listItem', appendChild: listi.calendar.elem }));

	dom.getElemById('list').appendChild(listFragment);
};
