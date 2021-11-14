import './index.css';

import dom from 'dom';

class Button {
	constructor({ className, ...rest }) {
		this.elem = dom.createElem('button', { className: `button${className ? ` ${className}` : ''}`, ...rest });

		return this.elem;
	}
}

export default Button;
