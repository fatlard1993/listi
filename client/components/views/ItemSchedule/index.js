import dom from 'dom';
import socketClient from 'socket-client';

import router from '../../../router';

import Toolbar from '../../Toolbar';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import Calendar from '../../Calendar';
import DomElem from '../../DomElem';
import UnloadAwareView from '../UnloadAwareView';
import BeforePageChangeDialog from '../../BeforePageChangeDialog';

export default class ItemSchedule extends UnloadAwareView {
	constructor({ listName = dom.location.query.get('listName'), index = dom.location.query.get('index'), item, className, state, ...rest }) {
		super({ className: ['itemSchedule', className], ...rest });

		const { draw } = router;

		if (!listName) {
			router.path = router.ROUTES.filters;

			return;
		}

		dom.location.query.set({ listName, index, view: 'ItemSchedule' });

		socketClient.on('state', newState => this.render({ listName, index, item, className, ...rest, state: newState }));

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
						new BeforePageChangeDialog({
							appendTo,
							onYes: () => {
								router.path = router.buildPath(router.ROUTES.itemEdit, { id: 'new' });
								// draw('ListItemEdit', { listName, index, item }),
							},
						});
					},
				}),
				new IconButton({
					icon: 'save',
					onPointerPress: () => {
						router.path = router.buildPath(router.ROUTES.itemEdit, { id: 'new' });
						// draw('ListItemEdit', { listName, index, item }),
					},
				}),
				title,
			],
		});

		calendar.elem.classList.add('select');

		calendar.on('selectDay', evt => {
			const selectedItems = calendar.elem.querySelectorAll('.selected');

			if (evt.target.classList.contains('selected')) return;

			if (selectedItems) dom.classList(selectedItems, 'remove', 'selected');

			evt.target.classList.add('selected');

			item.due = evt.target.dataset.fullDate;
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
		dom.location.query.delete('index');

		super.cleanup();
	}
}
