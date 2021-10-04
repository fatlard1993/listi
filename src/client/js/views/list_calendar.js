import dom from 'dom';
import socketClient from 'socket-client';
import Calendar from 'calendar';

import listi from 'listi';

listi.views.list_calendar = name => {
	name = name || dom.location.query.get('list');

	dom.location.query.set({ view: 'list_calendar', list: name });

	const list = listi.state?.lists?.[name];

	listi.log()('list_calendar', name, list);

	if (name && !list) return socketClient.reply('lists', name);

	const listFragment = dom.createFragment();

	listi.calendar = new Calendar();

	listi.drawToolkit([
		{ id: 'lists', onPointerPress: () => listi.draw('list', name) },
		{ type: 'h1', appendChild: listi.calendar.title },
	]);

	list?.items?.forEach((item, index) => {
		if (item.due) listi.calendar.addEvent({ index, label: item.summary, at: item.due });
	});

	listi.calendar.on('selectDay', evt => {
		listi.draw('list_item_edit', { listName: name, listItem: { due: evt.fullDate } });
	});

	listi.calendar.on('selectEvent', evt => {
		listi.draw('list_item_edit', { index: evt.index, listName: name });
	});

	listi.calendar.render();

	listFragment.appendChild(dom.createElem('li', { id: 'calendar', className: 'listItem', appendChild: listi.calendar.elem }));

	dom.getElemById('list').appendChild(listFragment);
};
