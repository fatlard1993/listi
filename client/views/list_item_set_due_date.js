import dom from 'dom';

import listi from '../listi';
import Toolbar from '../components/Toolbar';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import Calendar from '../components/Calendar';

export default ({ listName, index, listItem }) => {
	const list = listi.state.lists[listName];

	listi.log('Set Due Date', { listName, index, listItem });

	const appendTo = dom.getElemById('app');

	const title = new PageHeader();

	listi.calendar = new Calendar({ title });

	new Toolbar({
		appendTo,
		appendChildren: [
			new Button({ id: 'back', onPointerPress: () => listi.draw('list_item_edit', { listName, index, listItem }) }),
			new Button({
				id: 'save',
				onPointerPress: () => listi.draw('list_item_edit', { listName, index, listItem }),
			}),
			title,
		],
	});

	list.items.forEach(({ due: at, summary: label }, index) => {
		if (at) listi.calendar.addEvent({ index, at, label });
	});

	listi.calendar.elem.classList.add('select');

	listi.calendar.on('selectDay', evt => {
		const selectedItems = listi.calendar.elem.querySelectorAll('.selected');

		if (evt.target.classList.contains('selected')) return;

		if (selectedItems) dom.classList(selectedItems, 'remove', 'selected');

		evt.target.classList.add('selected');

		listItem.due = evt.target.dataset.fullDate;
	});

	listi.calendar.render();

	dom.createElem('div', { id: 'calendar', appendChild: listi.calendar.elem, appendTo });
};
