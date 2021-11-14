import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../listi';
import Toolbar from '../components/Toolbar';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import EditForm from '../components/EditForm';
import LabeledElement from '../components/LabeledElement';

export default name => {
	name = name || dom.location.query.get('list') || '';

	dom.location.query.set({ view: 'list_edit', list: name });

	const list = listi.state?.lists?.[name] || {};

	if (typeof name !== 'string') name = '';

	if (name && !list) return socketClient.reply('lists', name);

	listi.log()('list_edit', list);

	const appendTo = dom.getElemById('app');

	listi.save = () => {
		socketClient.reply('list_edit', { name, update: { name: nameInput.value } });

		dom.location.query.set({ view: name ? 'list' : 'lists', list: name });
	};

	const toolbarItems = [
		new Button({ id: 'back', onPointerPress: () => listi.draw(name ? 'list' : 'lists', name) }),
		new PageHeader({ textContent: `${name ? 'Edit' : 'Create new'} list` }),
		new Button({ id: 'save', className: 'right', onPointerPress: listi.save }),
	];

	if (name) {
		toolbarItems.push(
			new Button({
				id: 'delete',
				className: 'right',
				onPointerPress: () => {
					socketClient.reply('list_edit', { name, remove: true });

					dom.location.query.set({ view: 'lists' });
				},
			}),
		);
	}

	new Toolbar({
		appendTo,
		appendChildren: toolbarItems,
	});

	const nameInput = new LabeledElement('input', { label: 'Name', type: 'text', value: name });

	new EditForm({ appendTo, appendChildren: [nameInput.parentElem] });

	nameInput.select();
};
