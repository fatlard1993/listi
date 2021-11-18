import './index.css';

import listi from '../../listi';

import DomElem from '../DomElem';

export default class List extends DomElem {
	constructor({ className, ...rest }) {
		super('ul', { className: ['list', className], ...rest });

		this.onMove = () => {
			listi.state.disablePointerPress = true;
		};

		this.addEventListener('scroll', this.onMove);
		this.addEventListener('touchmove', this.onMove);
	}

	cleanup() {
		console.log('LIST CLEANUP');

		this.removeEventListener('scroll', this.onMove);
		this.removeEventListener('touchmove', this.onMove);

		super.cleanup();
	}
}
