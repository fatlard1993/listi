import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.list_edit = name => {
	name = name || dom.location.query.get('list');

	dom.location.query.set({ view: 'list_edit', list: name });

	const list = listi.state?.lists?.[name] || {};

	if (typeof name !== 'string') name = '';

	if (name && !list) return socketClient.reply('list', name);

	listi.log()('list_edit', list);

	const listFragment = dom.createFragment();

	const editWrapper = dom.createElem('li', { id: 'edit', className: 'listItem', appendTo: listFragment });

	const nameInput = dom.createElem('input', { type: 'text', value: name, appendTo: dom.createElem('label', { textContent: 'Name', appendTo: editWrapper }) });

	listi.save = () => {
		socketClient.reply('list_edit', { name, update: { name: nameInput.value } });
	};

	const toolbar = [
		{ id: 'lists', onPointerPress: () => listi.draw(name ? 'list' : 'lists', name) },
		{ id: 'save', onPointerPress: listi.save },
		{ type: 'h1', textContent: `${name ? 'Edit' : 'Create new'} list` },
	];

	if (name) {
		toolbar.splice(toolbar.length - 1, 0, {
			id: 'delete',
			onPointerPress: evt => {
				listi.log()(evt);

				socketClient.reply('list_edit', { name, remove: true });
			},
		});
	}

	listi.drawToolkit(toolbar);

	dom.getElemById('list').appendChild(listFragment);

	nameInput.select();
};
