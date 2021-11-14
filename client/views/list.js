import dom from 'dom';

import listi from '../listi';
import Toolbar from '../components/Toolbar';
import List from '../components/List';
import ListItem from '../components/ListItem';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

export default name => {
	name = name || dom.location.query.get('list');

	const list = listi.state?.lists?.[name];

	if (!list) return listi.draw('lists');

	dom.location.query.set({ view: 'list', list: name });

	const { items, filter } = list;

	if (!items) {
		listi.log.error()(`No current selected list`);

		listi.draw('lists');

		return;
	}

	listi.log()('list', name, items, filter);

	const appendTo = dom.getElemById('app');

	new Toolbar({
		appendTo,
		appendChildren: [
			new Button({ id: 'back', onPointerPress: () => listi.draw('lists') }),
			new Button({ id: 'calendar', onPointerPress: () => listi.draw('list_calendar', name) }),
			new Button({ id: 'filter', onPointerPress: () => listi.draw('list_filter', name) }),
			new Button({ id: 'edit', onPointerPress: () => listi.draw('list_edit', name) }),
			new PageHeader({ textContent: name }),
			new Button({ id: 'add', className: 'right', onPointerPress: () => listi.draw('list_item_edit', { listName: name }) }),
		],
	});

	if (!items.length) {
		dom.createElem('li', { appendTo, textContent: 'No lists items yet .. Create some with the + button above' });
	} else {
		const body = dom.createFragment();

		const sortedItems = items.map((item, index) => ({ ...item, index })).sort((a, b) => new Date(a.due) - new Date(b.due));

		sortedItems.forEach(item => new ListItem({ appendTo: body, item, listName: name }));

		new List({ appendTo, body });
	}
};
