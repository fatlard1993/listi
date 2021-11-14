import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../listi';
import Toolbar from '../components/Toolbar';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import Calendar from '../components/Calendar';

export default name => {
	name = name || dom.location.query.get('list');

	dom.location.query.set({ view: 'list_calendar', list: name });

	const list = listi.state?.lists?.[name];

	listi.log()('list_calendar', name, list);

	if (name && !list) return socketClient.reply('lists', name);

	const appendTo = dom.getElemById('app');

	const title = new PageHeader();

	listi.calendar = new Calendar({ title });

	new Toolbar({
		appendTo,
		appendChildren: [new Button({ id: 'back', onPointerPress: () => listi.draw('list', name) }), title],
	});

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

	dom.createElem('div', { id: 'calendar', appendChild: listi.calendar.elem, appendTo });
};
