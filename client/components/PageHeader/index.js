import dom from 'dom';

class PageHeader {
	constructor({ textContent } = {}) {
		this.elem = dom.createElem('h1', { textContent });

		return this.elem;
	}
}

export default PageHeader;
