import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.lists = function(lists){
	if(!lists) return listi.log.error()(`No lists`);

	listi.log()('lists', lists);

	var listFragment = dom.createFragment();

	listi.drawToolkit([
		{ id: 'add', onPointerPress: listi.draw.bind(this, 'list_edit') }
	]);

	if(!lists.length){
		return dom.createElem('li', { textContent: 'No lists yet .. Create some with the + button above', appendTo: dom.getElemById('list') });
	}

	lists.forEach((name) => {
		dom.createElem('li', {
			textContent: name,
			className: 'list',
			appendTo: listFragment,
			appendChild: dom.createElem('button', { className: 'edit', onPointerPress: () => { listi.draw('list_edit', name);} }),
			onPointerPress: () => { socketClient.reply('list', name); }
		});
	});

	dom.getElemById('list').appendChild(listFragment);
};