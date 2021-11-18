import socketClient from 'socket-client';

import listi from '../../../listi';

import Toolbar from '../../Toolbar';
import List from '../../List';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import DomElem from '../../DomElem';
import View from '../View';

export default class Lists extends View {
	constructor({ className, state, ...rest }) {
		super({ className: ['lists', className], ...rest });

		socketClient.on('state', newState => listi.draw('Lists', { className, ...rest, state: newState }));

		if (!state) return socketClient.reply('request_state', true);

		const { checkDisabledPointer, load } = listi;
		const appendTo = this.elem;
		const { listNames } = state;

		new Toolbar({
			appendTo,
			appendChildren: [new PageHeader({ textContent: 'Listi' }), new IconButton({ icon: 'add', className: 'right', onPointerPress: evt => checkDisabledPointer(evt, () => load('ListEdit')) })],
		});

		if (!listNames.length) {
			new DomElem('div', { appendTo, textContent: 'No lists yet .. Create some with the + button above' });
		} else {
			this.list = new List({
				appendTo,
				appendChildren: listNames.map(
					listName =>
						new DomElem('li', {
							className: 'list',
							onPointerPress: evt => checkDisabledPointer(evt, () => load('SingleList', { listName })),
							appendChildren: [
								new DomElem('h2', {
									className: 'listTitle',
									textContent: listName,
								}),
								new IconButton({
									icon: 'edit',
									onPointerPress: evt => checkDisabledPointer(evt, () => load('ListEdit', { listName })),
								}),
							],
						}),
				),
			});
		}
	}

	cleanup() {
		socketClient.clearEventListeners();

		if (this?.list?.cleanup) this.list.cleanup();

		super.cleanup();
	}
}
