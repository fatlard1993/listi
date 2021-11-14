import './index.css';

import dom from 'dom';

import Tag from '../Tag';

class TagList {
	constructor({ appendTo, body, items, className }) {
		this.elem = dom.createElem('ul', { className: `tagList${className ? ` ${className}` : ''}`, appendTo });

		if (body) {
			this.elem.appendChild(body);
		} else if (items) {
			items.forEach(name => new Tag({ name, appendTo: this.elem }));
		}

		return this.elem;
	}
}

export default TagList;
