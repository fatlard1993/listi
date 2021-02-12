import dom from 'dom';
import socketClient from 'socket-client';

import listi from 'listi';

listi.views.list_edit = function(name){
	if(typeof name !== 'string') name = '';

	listi.log()(name);

	var listFragment = dom.createFragment();

	var editWrapper = dom.createElem('li', { id: 'edit', className: 'listItem', appendTo: listFragment });

	var nameInput = dom.createElem('input', { type: 'text', value: name, appendTo: dom.createElem('label', { textContent: 'Name', appendTo: editWrapper }) });

	listi.save = () => { socketClient.reply('list_edit', { name, new: { name: nameInput.value } }); };

	var toolkit = [
		{
			id: 'lists',
			onPointerPress: () => {
				socketClient.reply('lists');
			}
		},
		{
			id: 'save',
			onPointerPress: () => {
				listi.save();
			}
		},
		{ type: 'div', textContent: `${name ? 'Edit' : 'Create new'} list` }
	];

	if(name){
		toolkit.splice(toolkit.length - 1, 0, {
			id: 'delete',
			onPointerPress: (evt) => {
				listi.log()(evt);

				socketClient.reply('list_edit', { name, delete: true });
			}
		});
	}

	listi.drawToolkit(toolkit);

	dom.getElemById('list').appendChild(listFragment);

	nameInput.select();
};