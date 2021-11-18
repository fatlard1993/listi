import './index.css';

import DomElem from '../DomElem';

export default class NoData extends DomElem {
	constructor({ appendTo, className, name }) {
		super('div', {
			className: ['noData', className],
			appendTo,
			textContent: name,
		});
	}
}
