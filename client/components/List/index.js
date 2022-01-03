import './index.css';

import state from '../../state';

import DomElem from '../DomElem';

export default class List extends DomElem {
	constructor({ className, ...rest }) {
		super('ul', { className: ['list', className], ...rest });

		this.onMove = () => {
			state.disablePointerPress = true;
		};

		this.addEventListener('scroll', this.onMove);
		this.addEventListener('touchmove', this.onMove);
	}

	cleanup() {
		state.disablePointerPress = false;

		if (this.removeEventListener) {
			this.removeEventListener('scroll', this.onMove);
			this.removeEventListener('touchmove', this.onMove);
		}

		super.cleanup();
	}
}
