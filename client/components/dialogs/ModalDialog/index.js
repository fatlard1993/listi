import dom from 'dom';

import Modal from '../../Modal';
import Dialog from '../Dialog';

export default class ModalDialog {
	constructor({ appendTo, header, content, footer, buttons, onDismiss = () => {}, ...rest }) {
		this.modal = new Modal({ appendTo });
		this.dialog = new Dialog({
			appendTo: this.modal,
			header,
			content,
			footer,
			buttons,
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
