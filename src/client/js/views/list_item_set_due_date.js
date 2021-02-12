import dom from 'dom';
import Calendar from 'calendar';

import listi from 'listi';

listi.views.list_item_set_due_date = function(item){
	var listFragment = dom.createFragment(), dueDate;

	listi.drawToolkit([
		{
			id: 'lists',
			onPointerPress: () => {
				listi.draw('list_item_edit', item);
			}
		},
		{
			id: 'save',
			onPointerPress: () => {
				item.due = dueDate;

				listi.draw('list_item_edit', item);
			}
		}
	]);

	listi.calendar = new Calendar();

	listi.lists[item.listName].arr.forEach((item, index) => { if(item.due) listi.calendar.addEvent({ index, label: item.summary, at: item.due }); });

	listi.calendar.elem.classList.add('select');

	listi.calendar.on('selectDay', (evt) => {
		var selectedItems = listi.calendar.elem.querySelectorAll('.selected');

		if(evt.target.classList.contains('selected') || selectedItems.length > 1) dom.classList(selectedItems, 'remove', 'selected');

		evt.target.classList.add('selected');

		selectedItems = listi.calendar.elem.querySelectorAll('.selected');

		dueDate = selectedItems.length > 1 ? `${selectedItems[0].dataset.fullDate} - ${selectedItems[1].dataset.fullDate}` : evt.target.dataset.fullDate;
	});

	dom.getElemById('toolkit').appendChild(listi.calendar.title);

	listi.calendar.render();

	listFragment.appendChild(dom.createElem('li', { id: 'calendar', className: 'listItem', appendChild: listi.calendar.elem }));

	dom.getElemById('list').appendChild(listFragment);
};