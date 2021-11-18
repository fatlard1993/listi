import './index.css';

import DomElem from '../DomElem';

export default class Tag extends DomElem {
	constructor({ appendTo, className, tag }) {
		super('li', {
			className: ['tag', className],
			appendTo,
			textContent: tag,
			onPointerPressAndHold: () => this.remove(),
		});
	}
}
