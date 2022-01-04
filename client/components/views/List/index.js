import socketClient from 'socket-client';

import router from '../../../router';

import Toolbar from '../../Toolbar';
import ListElem from '../../List';
import Item from '../../Item';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import View from '../View';
import ModalDialog from '../../ModalDialog';
import LabeledSelect from '../../LabeledSelect';
import NoData from '../../NoData';

export default class List extends View {
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
		const { filterIds, filters, itemIds, items } = serverState;
		const filterNames = filterIds.map(id => filters[id]?.name);
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
				onPointerPress: () => {
					new ModalDialog({
						appendTo,
						header: 'Create',
						content: 'Create a new Filter or Item?',
						buttons: ['Filter', 'Item', 'Cancel'],
						onDismiss: ({ button, closeDialog }) => {
							if (button === 'Filter') {
								router.path = router.buildPath(router.ROUTES.filterEdit, { id: 'new' });
							} else if (button === 'Item') {
								router.path = router.buildPath(router.ROUTES.itemEdit, { id: 'new' });
							}

							closeDialog();
						},
					});
				},
			}),
		];

		if (filterIds.length) {
			toolbarItems.splice(
				2,
				0,
				new IconButton({
					icon: 'filter',
					onPointerPress: () => {
						const { label: selectLabel, select: filterSelect } = new LabeledSelect({ label: 'Current Filter', options: ['Unfiltered', ...filterNames], value: filterName || 'Unfiltered' });

						new ModalDialog({
							appendTo,
							header: 'Change List Filter',
							content: [selectLabel],
							buttons: ['OK', 'Edit Filter', 'Cancel'],
							onDismiss: ({ button, closeDialog }) => {
								const selectedFilterId = filterIds[filterNames.indexOf(filterSelect.value)];

								console.log('selectedFilterId', selectedFilterId);
								console.log('filterNames.indexOf(filterSelect.value)', filterNames.indexOf(filterSelect.value));
								console.log('filterSelect.value', filterSelect.value);

								if (button === 'OK') {
									router.path = filterSelect.value === 'Unfiltered' ? router.ROUTES.list : router.routeToPath(router.ROUTES.filteredList, { filterId: selectedFilterId });
								} else if (button === 'Edit Filter' && selectedFilterId) {
									router.path = router.routeToPath(router.ROUTES.filterEdit, { id: selectedFilterId });
								}

								closeDialog();
							},
						});
					},
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
		console.log('List CLEANUP');
		socketClient.clearEventListeners();

		if (this?.list?.cleanup) this.list.cleanup();
		console.log('List CLEANUP 3');

		super.cleanup();
		console.log('List CLEANUP 4');
	}
}
