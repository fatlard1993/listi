import './index.css';

import dom from 'dom';

class List {
	constructor({ appendTo, body, items }) {
		this.elem = dom.createElem('ul', { id: 'list', appendTo });

		if (body) {
			this.elem.appendChild(body);
		} else if (items) {
			items.forEach(item => {
				this.elem.appendChild(dom.createElem('li', item));
			});
		}

		return this.elem;
	}
}

export default List;
