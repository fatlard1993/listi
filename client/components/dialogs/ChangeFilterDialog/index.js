import router from '../../../router';

import { Select } from '../../inputs';
import Label from '../../Label';
import ModalDialog from '../ModalDialog';

export default class ChangeFilterDialog extends ModalDialog {
	constructor({ serverState, filterName, ...rest }) {
		const { filterIds, filters } = serverState;
		const filterNames = filterIds.map(id => filters[id]?.name);

		const filterSelect = new Select({ options: ['Unfiltered', ...filterNames], value: filterName || 'Unfiltered' });

		super({
			header: 'Change Filter',
			content: [new Label({ label: 'Current Filter', appendChild: filterSelect })],
			buttons: ['OK', 'Edit Filter', 'New Filter', 'Cancel'],
			onDismiss: ({ button, closeDialog }) => {
				const selectedFilterId = filterIds[filterNames.indexOf(filterSelect.value)];

				if (button === 'OK') {
					router.path = filterSelect.value === 'Unfiltered' ? router.ROUTES.list : router.routeToPath(router.ROUTES.filteredList, { filterId: selectedFilterId });
				} else if (button === 'Edit Filter' && selectedFilterId) {
					router.path = router.routeToPath(router.ROUTES.filterEdit, { id: selectedFilterId });
				} else if (button === 'New Filter') {
					router.path = router.routeToPath(router.ROUTES.filterEdit, { id: 'new' });
				}

				closeDialog();
			},
			...rest,
		});

		this.filterSelect = filterSelect;
	}
}
