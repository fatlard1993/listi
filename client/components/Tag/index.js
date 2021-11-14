import './index.css';

import dom from 'dom';

class Tag {
	constructor({ appendTo, name }) {
		this.elem = dom.createElem('li', {
			className: 'tag',
			appendTo,
			textContent: name,
			onPointerPressAndHold: evt => {
				dom.remove(evt.target);
			},
		});

		return this.elem;
	}
}

export default Tag;
