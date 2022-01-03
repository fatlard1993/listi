import dom from 'dom';
import socketClient from 'socket-client';

import router from '../../../router';

import Toolbar from '../../Toolbar';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import Calendar from '../../Calendar';
import DomElem from '../../DomElem';
import View from '../View';

export default class ListCalendar extends View {
	constructor({ filterId, listName = dom.location.query.get('listName'), className, state, ...rest }) {
		super({ className: ['listCalendar', className], ...rest });

		const { draw } = router;

		if (!listName) {
			router.path = router.ROUTES.filters;

			return;
		}

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
			appendChildren: [
				new IconButton({
					icon: 'arrow-left',
					onPointerPress: () => {
						router.path = router.routeToPath(router.ROUTES.list, { filterId });
					},
				}),
				title,
			],
		});

		calendar.on('selectDay', evt => {
			router.path = router.routeToPath(router.ROUTES.listItemEdit, { id: filterId, listItem: { due: evt.fullDate } });
		});

		calendar.on('selectEvent', evt => {
			router.path = router.routeToPath(router.ROUTES.listItemEdit, { id: filterId, index: evt.index });
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
