import './index.css';

import dom from 'dom';

class EditForm {
	constructor({ className, ...rest }) {
		this.elem = dom.createElem('div', { className: `editForm${className ? ` ${className}` : ''}`, ...rest });

		return this.elem;
	}
}

export default EditForm;
