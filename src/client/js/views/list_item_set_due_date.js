import dom from 'dom';
import Calendar from 'calendar';

import listi from 'listi';

listi.views.list_item_set_due_date = function ({ index, listName, summary, description, tags }) {
	const listFragment = dom.createFragment();
	let due;

	listi.drawToolkit([
		{ id: 'lists', onPointerPress: listi.draw.bind(this, 'list_item_edit', { index, listName, summary, description, tags, due }) },
		{
			id: 'save',
			onPointerPress: () => {
				listi.draw('list_item_edit', { index, listName, summary, description, tags, due });
			},
		},
	]);

	listi.calendar = new Calendar();

	listi.lists[listName].items.forEach(({ due: at }, index) => {
		if (at) listi.calendar.addEvent({ index, at, label: summary });
	});

	listi.calendar.elem.classList.add('select');

	listi.calendar.on('selectDay', evt => {
		let selectedItems = listi.calendar.elem.querySelectorAll('.selected');

		if (evt.target.classList.contains('selected') || selectedItems.length > 1) dom.classList(selectedItems, 'remove', 'selected');

		evt.target.classList.add('selected');

		selectedItems = listi.calendar.elem.querySelectorAll('.selected');

		due = selectedItems.length > 1 ? `${selectedItems[0].dataset.fullDate} - ${selectedItems[1].dataset.fullDate}` : evt.target.dataset.fullDate;
	});

	dom.getElemById('toolkit').appendChild(listi.calendar.title);

	listi.calendar.render();

	listFragment.appendChild(dom.createElem('li', { id: 'calendar', className: 'listItem', appendChild: listi.calendar.elem }));

	dom.getElemById('list').appendChild(listFragment);
};
