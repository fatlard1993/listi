import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.list_edit = function ({ name } = {}) {
	if (typeof name !== 'string') name = '';

	listi.log()(name);

	const listFragment = dom.createFragment();

	const editWrapper = dom.createElem('li', { id: 'edit', className: 'listItem', appendTo: listFragment });

	const nameInput = dom.createElem('input', { type: 'text', value: name, appendTo: dom.createElem('label', { textContent: 'Name', appendTo: editWrapper }) });

	listi.save = () => {
		socketClient.reply('list_edit', { name, new: { name: nameInput.value } });
	};

	const toolkit = [
		{ id: 'lists', onPointerPress: socketClient.reply.bind(this, 'lists') },
		{ id: 'save', onPointerPress: listi.save.bind(this) },
		{ type: 'div', textContent: `${name ? 'Edit' : 'Create new'} list` },
	];

	if (name) {
		toolkit.splice(toolkit.length - 1, 0, {
			id: 'delete',
			onPointerPress: evt => {
				listi.log()(evt);

				socketClient.reply('list_edit', { name, remove: true });
			},
		});
	}

	listi.drawToolkit(toolkit);

	dom.getElemById('list').appendChild(listFragment);

	nameInput.select();
};
