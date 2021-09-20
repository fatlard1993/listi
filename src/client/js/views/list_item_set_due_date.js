import dom from 'dom';
import Calendar from 'calendar';

import listi from 'listi';

listi.views.list_item_set_due_date = ({ listName, index, listItem }) => {
	const listFragment = dom.createFragment();

	listi.drawToolkit([
		{ id: 'lists', onPointerPress: () => listi.draw('list_item_edit', { listName, index, listItem }) },
		{
			id: 'save',
			onPointerPress: () => listi.draw('list_item_edit', { listName, index, listItem }),
		},
	]);

	listi.calendar = new Calendar();

	listi.state.lists[listName].items.forEach(({ due: at }, index) => {
		if (at) listi.calendar.addEvent({ index, at, label: listItem.summary });
	});

	listi.calendar.elem.classList.add('select');

	listi.calendar.on('selectDay', evt => {
		const selectedItems = listi.calendar.elem.querySelectorAll('.selected');

		if (evt.target.classList.contains('selected')) dom.classList(selectedItems, 'remove', 'selected');

		evt.target.classList.add('selected');

		listItem.due = evt.target.dataset.fullDate;
	});

	dom.getElemById('toolkit').appendChild(listi.calendar.title);

	listi.calendar.render();

	listFragment.appendChild(dom.createElem('li', { id: 'calendar', className: 'listItem', appendChild: listi.calendar.elem }));

	dom.getElemById('list').appendChild(listFragment);
};
