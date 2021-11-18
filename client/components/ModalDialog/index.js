import dom from 'dom';

import Modal from '../Modal';
import Dialog from '../Dialog';

export default class ModalDialog {
	constructor({ appendTo, onDismiss = () => {}, ...rest }) {
		this.modal = new Modal({ appendTo });
		this.dialog = new Dialog({
			appendTo: this.modal,
			onDismiss: (...args) => {
				onDismiss(...args);

				this.cleanup();
			},
			...rest,
		});

		return this;
	}

	cleanup() {
		dom.remove(this.modal);
	}
}
