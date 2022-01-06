import './index.css';

import DomElem from '../DomElem';

export default class Label extends DomElem {
	constructor({ className, label, ...rest }) {
		super('div', { className: ['label', className], ...rest });

		if (label) this.appendChild(new DomElem('span', { className: 'label-text', textContent: label }));
	}
}
