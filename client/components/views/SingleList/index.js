import socketClient from 'socket-client';

import router from '../../../router';

import Toolbar from '../../Toolbar';
import List from '../../List';
import ListItem from '../../ListItem';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import View from '../View';
import ModalDialog from '../../ModalDialog';
import LabeledSelect from '../../LabeledSelect';
import NoData from '../../NoData';

export default class SingleList extends View {
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

		super.render({ className: ['singleList', className], ...rest });

		const { filterId } = router.parseRouteParams();
		const { name: filterName } = serverState.filters[filterId] || {};

		if (!filterName && filterId) {
			router.path = router.ROUTES.list;

			return;
		}

		console.log(`Loaded filter ${filterName}`);

		const appendTo = this.elem;
		const { filterIds, filters } = serverState;
		const filterNames = filterIds.map(id => filters[id]?.name);
		const listItems = [].sort((a, b) => new Date(a.due) - new Date(b.due));

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
					router.path = router.routeToPath(router.ROUTES.listCalendar, { filterId });
				},
			}),
			new PageHeader({ textContent: `${filterName ? 'Filtered ' : ''}List Items${filterName ? ` (${filterName})` : ''}` }),
			new IconButton({
				icon: 'plus',
				className: 'right',
				onPointerPress: () => {
					new ModalDialog({
						appendTo,
						header: 'Create',
						content: 'Create a new Filter or List Item?',
						buttons: ['Filter', 'List Item', 'Cancel'],
						onDismiss: ({ button, closeDialog }) => {
							if (button === 'Filter') {
								router.path = router.buildPath(router.ROUTES.filterEdit, { id: 'new' });
							} else if (button === 'List Item') {
								router.path = router.buildPath(router.ROUTES.listItemEdit, { id: 'new' });
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

		if (!listItems?.length) {
			new NoData({ appendTo, textContent: 'No list items yet .. Create them with the + button above' });
		} else {
			this.list = new List({ appendTo, appendChildren: listItems.map(({ id }) => new ListItem({ id })) });
		}
	}

	cleanup() {
		console.log('SingleList CLEANUP');
		socketClient.clearEventListeners();

		if (this?.list?.cleanup) this.list.cleanup();
		console.log('SingleList CLEANUP 3');

		super.cleanup();
		console.log('SingleList CLEANUP 4');
	}
}
