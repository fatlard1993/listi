import './index.css';

import dom from 'dom';

import DomElem from '../../DomElem';

export default class View {
	constructor({ className, ...rest }) {
		this.elem = new DomElem('div', { className: ['view', className], ...rest });
		console.log('RENDER VIEW');
	}

	cleanup() {
		console.log('VIEW CLEANUP');
		dom.remove(this.elem);
	}
}
