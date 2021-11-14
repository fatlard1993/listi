import './index.css';

import dom from 'dom';

class Dialog {
	constructor({ appendTo }) {
		this.modal = dom.createElem('div', { id: 'dialogModal', appendTo });
		this.elem = dom.createElem('div', { id: 'dialog', appendTo: this.modal });

		return this.elem;
	}

	show() {
		dom.show(this.modal, '');
	}

	hide() {
		dom.disappear(this.modal);
	}
}

export default Dialog;
