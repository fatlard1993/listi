import socketClient from 'socket-client';

import router from '../../../router';

import Toolbar from '../../Toolbar';
import ListElem from '../../List';
import Item from '../../Item';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import View from '../View';
import CreateDialog from '../../dialogs/CreateDialog';
import NoData from '../../NoData';
import ChangeFilterDialog from '../../dialogs/ChangeFilterDialog';

export class List extends View {
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

		super.render({ className: ['list', className], ...rest });

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
		const sortedItems = filteredItems.sort((a, b) => new Date(a.due) - new Date(b.due));

		const toolbarItems = [
			new IconButton({
				icon: 'arrow-left',
				onPointerPress: () => {
					router.path = router.ROUTES.filters;
				},
			}),
			new IconButton({
				icon: 'calendar-alt',
				onPointerPress: () => {
					router.path = router.routeToPath(router.ROUTES.calendar, { filterId });
				},
			}),
			new PageHeader({ textContent: `${filterName ? 'Filtered ' : ''}Items${filterName ? ` (${filterName})` : ''}` }),
			new IconButton({
				icon: 'plus',
				className: 'right',
				onPointerPress: () => new CreateDialog({ appendTo }),
			}),
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

		if (!itemIds?.length) {
			new NoData({ appendTo, textContent: `No items${filterId ? ' that match this filter' : ''} yet .. Create them with the + button above` });
		} else {
			this.list = new ListElem({ appendTo, appendChildren: sortedItems.map(({ id }) => new Item({ serverState, id })) });
		}
	}

	cleanup() {
		socketClient.clearEventListeners();

		if (this?.list?.cleanup) this.list.cleanup();

		super.cleanup();
	}
}
