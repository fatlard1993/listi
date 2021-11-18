import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../../../listi';

import Toolbar from '../../Toolbar';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import Calendar from '../../Calendar';
import DomElem from '../../DomElem';
import View from '../View';

export default class ListCalendar extends View {
	constructor({ listName = dom.location.query.get('listName'), className, state, ...rest }) {
		super({ className: ['listCalendar', className], ...rest });

		const { load, draw, checkDisabledPointer } = listi;

		if (!listName) return load('Lists', {});

		dom.location.query.set({ listName, view: 'ListCalendar' });

		socketClient.on('state', newState => draw('ListCalendar', { listName, className, ...rest, state: newState }));

		if (!state) return socketClient.reply('request_state', true);

		const appendTo = this.elem;
		const { lists } = state;
		const { items } = lists[listName];

		const title = new PageHeader();
		const calendar = new Calendar({ title });

		new Toolbar({
			appendTo,
			appendChildren: [new IconButton({ icon: 'back', onPointerPress: evt => checkDisabledPointer(evt, () => load('SingleList', { listName })) }), title],
		});

		calendar.on('selectDay', evt => {
			load('ListItemEdit', { listName, listItem: { due: evt.fullDate } });
		});

		calendar.on('selectEvent', evt => {
			load('ListItemEdit', { index: evt.index, listName });
		});

		calendar.render();

		new DomElem('div', { id: 'calendar', appendChild: calendar.elem, appendTo });

		items.forEach(({ due: at, summary: label }, index) => {
			if (at) calendar.addEvent({ index, at, label });
		});
	}

	cleanup() {
		socketClient.clearEventListeners();

		dom.location.query.delete('listName');

		super.cleanup();
	}
}
