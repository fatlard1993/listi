import socketClient from 'socket-client';

import router from '../../../router';

import Toolbar from '../../Toolbar';
import List from '../../List';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import View from '../View';
import NoData from '../../NoData';
import FilterCard from '../../FilterCard';
import ModalDialog from '../../ModalDialog';

export default class Filters extends View {
	constructor({ className, state: serverState, ...rest }) {
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

		super.render({ className: ['filters', className], ...rest });

		const appendTo = this.elem;
		const { filterIds, filters } = serverState;

		new Toolbar({
			appendTo,
			appendChildren: [
				new IconButton({
					icon: 'list',
					onPointerPress: () => {
						router.path = router.buildPath(router.ROUTES.list);
					},
				}),
				new IconButton({
					icon: 'calendar-alt',
					onPointerPress: () => {
						router.path = router.buildPath(router.ROUTES.listCalendar);
					},
				}),
				new PageHeader({ textContent: 'Filters' }),
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
			],
		});

		if (!filterIds?.length) {
			new NoData({ appendTo, textContent: 'No filters yet .. Create them with the + button above' });
		} else {
			this.list = new List({
				appendTo,
				appendChildren: filterIds.map(filterId => new FilterCard({ filterId, filter: filters[filterId] })),
			});
		}
	}

	cleanup() {
		socketClient.clearEventListeners();

		if (this?.list?.cleanup) this.list.cleanup();

		super.cleanup();
	}
}
