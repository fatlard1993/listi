import dom from 'dom';
import Calendar from 'calendar';

import listi from 'listi';

listi.views.list_item_set_due_date = ({ listName, index, listItem }) => {
	const list = listi.state.lists[listName];

	const listFragment = dom.createFragment();

	listi.log('Set Due Date', { listName, index, listItem });

	listi.drawToolkit([
		{ id: 'back', onPointerPress: () => listi.draw('list_item_edit', { listName, index, listItem }) },
		{
			id: 'save',
			onPointerPress: () => listi.draw('list_item_edit', { listName, index, listItem }),
		},
	]);

	listi.calendar = new Calendar();

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

	dom.getElemById('toolbar').appendChild(listi.calendar.title);

	listi.calendar.render();

	listFragment.appendChild(dom.createElem('li', { id: 'calendar', className: 'listItem', appendChild: listi.calendar.elem }));

	dom.getElemById('list').appendChild(listFragment);
};
