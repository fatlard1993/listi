import dom from 'dom';

import { buildClassName } from '../util';

export default class DomElem {
	constructor(nodeName, { className, ...options } = {}) {
		this.elem = dom.createElem(nodeName, { className: buildClassName(className), ...options });

		return this.elem;
	}

	cleanup() {
		dom.remove(this);
	}
}
