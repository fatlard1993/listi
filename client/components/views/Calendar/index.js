import dom from 'dom';
import socketClient from 'socket-client';

import router from '../../../router';

import Toolbar from '../../Toolbar';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import CalendarElem from '../../Calendar';
import DomElem from '../../DomElem';
import View from '../View';
import ChangeFilterDialog from '../../dialogs/ChangeFilterDialog';

export default class Calendar extends View {
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

		super.render({ className: ['calendar', className], ...rest });

		const { filterId } = router.parseRouteParams();
		const { name: filterName, tags: filterTags } = serverState.filters[filterId] || {};

		if (!filterName && filterId) {
			router.path = router.ROUTES.list;

			return;
		}

		console.log(`Loaded filter ${filterName}`);

		const appendTo = this.elem;
		const { filterIds, itemIds, items } = serverState;
		const itemList = itemIds.map(id => items[id]);
		const filteredItems = filterTags?.length ? itemList.filter(({ tags }) => tags.some(tag => filterTags.includes(tag))) : itemList;

		const title = new PageHeader();
		const calendar = new CalendarElem({ title });

		const toolbarItems = [
			new IconButton({
				icon: 'arrow-left',
				onPointerPress: () => {
					router.path = router.routeToPath(router.ROUTES.list, { filterId });
				},
			}),
			new IconButton({
				icon: 'list',
				onPointerPress: () => {
					router.path = router.routeToPath(router.ROUTES.list, { filterId });
				},
			}),
			title,
		];

		if (filterIds.length) {
			toolbarItems.splice(
				2,
				0,
				new IconButton({
					icon: 'filter',
					onPointerPress: () => new ChangeFilterDialog({ serverState, filterName, appendTo }),
				}),
			);
		}

		new Toolbar({
			appendTo,
			appendChildren: toolbarItems,
		});

		calendar.on('selectDay', evt => {
			router.path = router.routeToPath(router.ROUTES.itemEdit, { id: filterId, item: { due: evt.fullDate } });
		});

		calendar.on('selectEvent', evt => {
			router.path = router.routeToPath(router.ROUTES.itemEdit, { id: filterId, index: evt.index });
		});

		calendar.render();

		new DomElem('div', { id: 'calendar', appendChild: calendar.elem, appendTo });

		filteredItems.forEach(({ due: at, summary: label }, index) => {
			if (at) calendar.addEvent({ index, at, label });
		});
	}

	cleanup() {
		socketClient.clearEventListeners();

		dom.location.query.delete('listName');

		super.cleanup();
	}
}
