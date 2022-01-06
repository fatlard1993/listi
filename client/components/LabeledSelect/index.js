import './index.css';

import dom from 'dom';

import DomElem from '../DomElem';
import Label from '../Label';

export default class LabeledSelect {
	constructor({ label, value = '', appendTo, ...rest }) {
		const initialValue = value;

		this.label = new Label({ label, appendTo });
		this.select = new DomElem('select', { appendTo: this.label, ...rest, value });

		this.select.isDirty = () => initialValue !== this.select.value;

		return this;
	}

	cleanup() {
		dom.remove(this.label);
	}
}
