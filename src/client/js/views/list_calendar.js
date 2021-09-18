import dom from 'dom';
import socketClient from 'socket-client';
import Calendar from 'calendar';

import listi from 'listi';

listi.views.list_calendar = function ({ name, items } = {}) {
	var listFragment = dom.createFragment();

	listi.drawToolkit([{ id: 'lists', onPointerPress: socketClient.reply.bind(this, 'list', name) }]);

	listi.calendar = new Calendar();

	items.forEach((item, index) => {
		if (item.due) listi.calendar.addEvent({ index, label: item.summary, at: item.due });
	});

	listi.calendar.on('selectDay', evt => {
		listi.draw('list_item_edit', { listName: name, due: evt.fullDate });
	});

	listi.calendar.on('selectEvent', evt => {
		listi.draw('list_item_edit', Object.assign({ index: evt.index, listName: name }, listi.lists[name].items[evt.index]));
	});

	dom.getElemById('toolkit').appendChild(listi.calendar.title);

	listi.calendar.render();

	listFragment.appendChild(dom.createElem('li', { id: 'calendar', className: 'listItem', appendChild: listi.calendar.elem }));

	dom.getElemById('list').appendChild(listFragment);
};
