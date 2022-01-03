import './index.css';

import DomElem from '../DomElem';

export default class Label extends DomElem {
	constructor({ className, ...rest }) {
		super('label', { className: ['label', className], ...rest });
	}
}
