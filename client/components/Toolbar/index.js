import './index.css';

import DomElem from '../DomElem';

export default class Toolbar extends DomElem {
	constructor({ className, ...rest }) {
		super('div', { className: ['toolbar', className], ...rest });
	}
}
