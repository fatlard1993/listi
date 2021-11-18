import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../../../listi';

import Toolbar from '../../Toolbar';
import List from '../../List';
import ListItem from '../../ListItem';
import IconButton from '../../IconButton';
import PageHeader from '../../PageHeader';
import DomElem from '../../DomElem';
import View from '../View';

export default class SingleList extends View {
	constructor({ listName = dom.location.query.get('listName'), className, state, ...rest }) {
		super({ className: ['singleList', className], ...rest });

		const { checkDisabledPointer, load, draw } = listi;

		if (!listName) return load('Lists', {});

		dom.location.query.set({ listName, view: 'SingleList' });

		socketClient.on('state', newState => draw('SingleList', { listName, className, ...rest, state: newState }));

		if (!state) return socketClient.reply('request_state', true);

		const appendTo = this.elem;
		const { lists } = state;
		const { items } = lists[listName];

		new Toolbar({
			appendTo,
			appendChildren: [
				new IconButton({ icon: 'back', onPointerPress: evt => checkDisabledPointer(evt, () => load('Lists', {})) }),
				new IconButton({ icon: 'calendar', onPointerPress: evt => checkDisabledPointer(evt, () => load('ListCalendar', { listName })) }),
				new IconButton({ icon: 'filter', onPointerPress: evt => checkDisabledPointer(evt, () => load('ListFilter', { listName })) }),
				new IconButton({ icon: 'edit', onPointerPress: evt => checkDisabledPointer(evt, () => load('ListEdit', { listName })) }),
				new PageHeader({ textContent: listName }),
				new IconButton({ icon: 'add', className: 'right', onPointerPress: evt => checkDisabledPointer(evt, () => load('ListItemEdit', { listName })) }),
			],
		});

		if (!items.length) {
			new DomElem('div', { appendTo, textContent: 'No list items yet .. Create some with the + button above' });
		} else {
			this.list = new List({ appendTo, appendChildren: items.map((item, index) => new ListItem({ index, item, listName })).sort((a, b) => new Date(a.due) - new Date(b.due)) });
		}
	}

	cleanup() {
		console.log('SingleList CLEANUP');
		socketClient.clearEventListeners();

		dom.location.query.delete('listName');
		console.log('SingleList CLEANUP 2');

		if (this?.list?.cleanup) this.list.cleanup();
		console.log('SingleList CLEANUP 3');

		super.cleanup();
		console.log('SingleList CLEANUP 4');
	}
}
