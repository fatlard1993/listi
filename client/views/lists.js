import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../listi';
import Toolbar from '../components/Toolbar';
import List from '../components/List';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

export default () => {
	dom.location.query.set({ view: 'lists' });

	if (!listi.state?.lists) return socketClient.reply('lists');

	const { listNames } = listi.state;

	const appendTo = dom.getElemById('app');

	new Toolbar({
		appendTo,
		appendChildren: [new PageHeader({ textContent: 'Listi' }), new Button({ id: 'add', className: 'right', onPointerPress: () => listi.draw('list_edit') })],
	});

	if (!listNames.length) {
		dom.createElem('li', { appendTo, textContent: 'No lists yet .. Create some with the + button above' });
	} else {
		const body = dom.createFragment();

		listNames.forEach(name => {
			dom.createElem('li', {
				appendTo: body,
				textContent: name,
				className: 'list',
				onPointerPress: () => listi.draw('list', name),
				appendChild: new Button({
					className: 'edit',
					onPointerPress: () => listi.draw('list_edit', name),
				}),
			});
		});

		new List({ appendTo, body });
	}
};
