import './index.css';

import dom from 'dom';

class Toolbar {
	constructor({ appendTo, appendChildren }) {
		this.elem = dom.createElem('div', { id: 'toolbar', appendTo, appendChildren });

		return this.elem;
	}
}

export default Toolbar;
