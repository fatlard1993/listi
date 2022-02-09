import dom from 'dom';
import socketClient from 'socket-client';

import router from '../../../router';

import { Toolbar } from '../../layout';
import { IconButton } from '../../inputs';
import PageHeader from '../../PageHeader';
import Calendar from '../../Calendar';
import DomElem from '../../DomElem';
import UnloadAwareView from '../UnloadAwareView';
import BeforePageChangeDialog from '../../dialogs/BeforePageChangeDialog';

export class ItemSchedule extends UnloadAwareView {
	constructor({ className, serverState, ...rest }) {
		super();

		this.options = { className, ...rest };

		socketClient.on('state', newState => this.render({ className, serverState: newState, ...rest }));

		this.render({ className, serverState, ...rest });
	}

	render({ className, serverState, ...rest }) {
		if (!serverState) {
			socketClient.reply('request_state', true);

			return undefined;
		}

		super.render({ className: ['itemSchedule', className], ...rest });

		const { id } = router.parseRouteParams();

		if (!id) {
			router.path = router.ROUTES.list;

			return;
		}

		const appendTo = this.elem;
		const { itemIds, items } = serverState;
		const itemList = itemIds.map(id => items[id]);
		const item = items[id];

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

		itemList.forEach(({ due: at, summary: label }, index) => {
			if (at) calendar.addEvent({ index, at, label });
		});
	}

	cleanup() {
		socketClient.clearEventListeners();

		super.cleanup();
	}
}
