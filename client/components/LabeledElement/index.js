import dom from 'dom';

class LabeledElement {
	constructor(elemName, { label, appendTo, ...options }) {
		console.log(elemName, { label, appendTo, ...options });
		this.labelElem = dom.createElem('label', { textContent: label, appendTo });
		this.elem = dom.createElem(elemName, { ...options, appendTo: this.labelElem });

		this.elem.parentElem = this.labelElem;

		return this.elem;
	}
}

export default LabeledElement;
