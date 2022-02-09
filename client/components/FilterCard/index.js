import './index.css';

import router from '../../router';

import DomElem from '../DomElem';
import { IconButton } from '../inputs';

export default class FilterCard extends DomElem {
	constructor({ className, filterId, filter }) {
		super('li', {
			className: ['filterCard', className],
			onPointerPress: () => {
				router.path = router.buildPath(router.ROUTES.filteredList, { filterId });
			},
			appendChildren: [
				new DomElem('h2', {
					className: 'cardTitle',
					textContent: filter.name,
				}),
				new IconButton({
					icon: 'edit',
					onPointerPress: () => {
						router.path = router.buildPath(router.ROUTES.filterEdit, { id: filterId });
					},
				}),
			],
		});
	}
}
