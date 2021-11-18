import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../../../listi';

import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import Toolbar from '../../Toolbar';
import View from '../View';

export default class ListFilter extends View {
	constructor({ listName = dom.location.query.get('listName'), className, ...rest }) {
		super({ className: ['listFilter', className], ...rest });

		if (!listName) return load('Lists', {});

		const appendTo = this.elem;
		const { load, checkDisabledPointer } = listi;

		new Toolbar({
			appendTo,
			appendChildren: [new IconButton({ icon: 'back', onPointerPress: evt => checkDisabledPointer(evt, () => load('SingleList', { listName })) }), new PageHeader({ textContent: 'Edit List Filter' })],
		});
	}

	cleanup() {
		socketClient.clearEventListeners();

		dom.location.query.delete('listName');

		super.cleanup();
	}
}
