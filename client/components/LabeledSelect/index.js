import './index.css';

import dom from 'dom';

import DomElem from '../DomElem';
import Label from '../Label';

export default class LabeledSelect {
	constructor({ label, appendTo, ...rest }) {
		this.label = new Label({ textContent: label, appendTo });
		this.select = new DomElem('select', { appendTo: this.label, ...rest });

		return this;
	}

	cleanup() {
		dom.remove(this.label);
	}
}
