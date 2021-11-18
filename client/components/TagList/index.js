import './index.css';

import DomElem from '../DomElem';

import Tag from '../Tag';

export default class TagList extends DomElem {
	constructor({ tags = [], className, ...rest }) {
		super('ul', { className: ['tagList', className], appendChildren: tags.map(tag => new Tag({ tag })), ...rest });
	}
}
