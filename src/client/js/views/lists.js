import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.lists = () => {
	const { listNames } = listi.state;

	const listFragment = dom.createFragment();

	listi.drawToolkit([
		{ type: 'h1', textContent: 'Listi' },
		{ id: 'add', className: 'right', onPointerPress: () => listi.draw('list_edit') },
	]);

	if (!listNames.length) {
		return dom.createElem('li', { textContent: 'No lists yet .. Create some with the + button above', appendTo: dom.getElemById('list') });
	}

	listNames.forEach(name => {
		dom.createElem('li', {
			textContent: name,
			className: 'list',
			appendTo: listFragment,
			appendChild: dom.createElem('button', {
				className: 'edit',
				onPointerPress: () => listi.draw('list_edit', name),
			}),
			onPointerPress: () => socketClient.reply('list', name),
		});
	});

	dom.getElemById('list').appendChild(listFragment);
};
