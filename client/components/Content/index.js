import './index.css';

import DomElem from '../DomElem';

export default class Content extends DomElem {
	constructor({ className, ...rest }) {
		super('div', { className: ['content', className], ...rest });
	}
}
