import dom from 'dom';

import Label from '../Label';
import TextInput from '../TextInput';

export default class LabeledTextInput {
	constructor({ label, appendTo, ...rest }) {
		this.label = new Label({ textContent: label, appendTo });
		this.textInput = new TextInput({ appendTo: this.label, ...rest });

		return this;
	}

	cleanup() {
		dom.remove(this.modal);
	}
}
