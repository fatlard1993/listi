import Log from 'log';
import dom from 'dom';
import socketClient from 'socket-client';
import Calendar from 'calendar';

const log = new Log({ verbosity: parseInt(dom.storage.get('logVerbosity') || 0) });

const listi = {
	tapAndHoldTime: 900,
	lists: {},
	isEditingText: function(){
		const activeElem = document.activeElement, activeNode = activeElem.nodeName;

		if(activeNode && (activeNode === 'textarea' || (activeNode === 'input' && activeElem.getAttribute('type') === 'text'))) return true;

		return false;
	},
	init: function(){
		dom.mobile.detect();

		socketClient.init();

		socketClient.on('lists', (lists) => {
			listi.draw('lists', lists);
		});

		socketClient.on('list', (list) => {
			listi.lists[list.name] = list;

			listi.draw('list', list);
		});

		dom.interact.on('keyUp', (evt) => {
			var { key } = evt;

			log(1)(key);

			if(key === 'Enter' && (listi.isEditingText() || evt.ctrlKey)){
				if(document.getElementsByClassName('showTagAdd').length) document.getElementById('tagAdd').pointerPressFunction();

				else if(typeof listi.save === 'function') listi.save();
			}
		});
	},
	draw: function(view, arg){
		if(!view || !listi[`draw_${view}`]) return log.error()(`"${view}" is an invalid view`);

		dom.empty(dom.getElemById('toolkit'));
		dom.empty(dom.getElemById('list'));

		delete listi.calendar;
		delete listi.save;

		listi[`draw_${view}`](arg);
	},
	draw_lists: function(lists){
		if(!lists) return log.error()(`No lists`);

		log()('lists', lists);

		var listFragment = dom.createFragment();

		listi.drawToolkit([
			{
				id: 'add',
				onPointerPress: listi.draw.bind(this, 'list_edit')
			}
		]);

		if(!lists.length){
			return dom.createElem('li', { textContent: 'No lists yet .. Create some with the + button above', appendTo: dom.getElemById('list') });
		}

		lists.forEach((name) => {
			dom.createElem('li', {
				textContent: name,
				className: 'list',
				appendTo: listFragment,
				appendChild: dom.createElem('div', { className: 'edit' }),
				onPointerPress: (evt) => {
					if(evt.target.classList.contains('edit')) listi.draw('list_edit', name);

					else socketClient.reply('list', name);
				}
			});
		});

		dom.getElemById('list').appendChild(listFragment);
	},
	draw_list: function(list){
		if(!list) return log.error()(`No current selected list`);

		log()(list);

		var listFragment = dom.createFragment();

		listi.drawToolkit([
			{ id: 'lists', onPointerPress: socketClient.reply.bind(this, 'lists') },
			{ id: 'calendar', onPointerPress: listi.draw.bind(this, 'list_calendar', list) },
			{ id: 'add', onPointerPress: listi.draw.bind(this, 'list_item_edit', { listName: list.name }) },
			{ id: 'filter', onPointerPress: listi.draw.bind(this, 'filter_edit', list) },
			{ id: 'sort', onPointerPress: listi.draw.bind(this, 'sort_edit', list) },
			{ type: 'div', textContent: list.name }
		]);

		if(!list.arr.length){
			return dom.createElem('li', { textContent: 'No list items yet .. Create some with the + button above', appendTo: dom.getElemById('list') });
		}

		list.arr.forEach((item, index) => {
			var tagList = listi.createTagList(item.tags);
			tagList.classList.add('displayOnly');

			dom.createElem('li', {
				textContent: item.summary,
				className: 'listItem',
				appendChildren: [
					dom.createElem('div', {
						className: 'edit',
						onPointerPress: () => {
							listi.draw('list_item_edit', Object.assign({ index, listName: list.name }, item));
						}
					}),
					dom.createElem('div', { textContent: item.description, className: 'description' }),
					dom.createElem('div', { textContent: item.due, className: 'dueDate' }),
					tagList
				],
				appendTo: listFragment,
				onPointerPressAndHold: () => {
					item.tags = item.tags || [];

					item.tags.push('completed');

					socketClient.reply('list_item_edit', { index, listName: list.name, new: item });
				}
			});
		});

		dom.getElemById('list').appendChild(listFragment);
	},
	draw_list_edit: function(name){
		if(typeof name !== 'string') name = '';

		log()(name);

		var listFragment = dom.createFragment();

		var editWrapper = dom.createElem('li', { id: 'edit', className: 'listItem', appendTo: listFragment });

		var nameInput = dom.createElem('input', { type: 'text', value: name, appendTo: dom.createElem('label', { textContent: 'Name', appendTo: editWrapper }) });

		listi.save = () => { socketClient.reply('list_edit', { name, new: { name: nameInput.value } }); };

		var toolkit =[
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
					log()(evt);

					socketClient.reply('list_edit', { name, delete: true });
				}
			});
		}

		listi.drawToolkit(toolkit);

		dom.getElemById('list').appendChild(listFragment);

		nameInput.select();
	},
	draw_list_item_edit: function(item = {}){
		log()(item);

		var listFragment = dom.createFragment();

		var editWrapper = dom.createElem('li', { id: 'edit', className: 'listItem', appendTo: listFragment });

		var summaryInput = dom.createElem('input', { type: 'text', value: item.summary || '', appendTo: dom.createElem('label', { textContent: 'Summary', appendTo: editWrapper }) });
		var descriptionInput = dom.createElem('textarea', { value: item.description || '', appendTo: dom.createElem('label', { textContent: 'Description', appendTo: editWrapper }) });

		var tagList = listi.createTagList(item.tags);
		var tagAdd = dom.createElem('button', {
			id: 'tagAdd',
			onPointerPress: () => {
				if(tagInput.value.length < 2 || Array.from(tagList.children).map((elem) => { return elem.textContent; }).includes(tagInput.value)) return;

				tagList.appendChild(listi.createTag(tagInput.value));

				tagAdd.parentElement.classList.remove('showTagAdd');

				tagInput.value = '';
			}
		});
		var tagInput = dom.createElem('input', {
			type: 'text',
			placeholder: 'Add new tags',
			onKeyUp: () => {
				tagAdd.parentElement.classList[tagInput.value.length > 1 ? 'add' : 'remove']('showTagAdd');
			}
		});

		dom.createElem('label', { textContent: 'Tags', appendChildren: [tagInput, tagAdd, tagList], appendTo: editWrapper });

		var dueDate = dom.createElem('button', {
			textContent: item.due ? (item.due instanceof Array ? item.due.join(' - ') : item.due) : 'Set',
			className: 'dueDate',
			appendTo: dom.createElem('label', { textContent: 'Due Date', appendTo: editWrapper }),
			onPointerPress: () => {
				this.draw('list_item_set_due_date', {
					index: item.index,
					listName: item.listName,
					summary: summaryInput.value,
					description: descriptionInput.value,
					tags: Array.from(tagList.children).map((elem) => { return elem.textContent; })
				});
			}
		});

		if(item.due){
			dom.createElem('label', {
				textContent: 'Recurring',
				appendTo: editWrapper,
				appendChildren: [
					dom.createElem('button', {
						textContent: 'Off'
					}),
					dom.createElem('button', {
						textContent: 'Absolute'
					}),
					dom.createElem('button', {
						textContent: 'Relative'
					})
				]
			});
		}

		//todo linked list, complete action

		listi.save = () => {
			socketClient.reply('list_item_edit', {
				index: item.index,
				listName: item.listName,
				new: {
					summary: summaryInput.value,
					description: descriptionInput.value,
					tags: Array.from(tagList.children).map((elem) => { return elem.textContent; }),
					due: dueDate.textContent === 'Set' ? undefined : dueDate.textContent.split(' - ')
				}
			});
		};

		var toolkit = [
			{
				id: 'lists',
				onPointerPress: () => {
					socketClient.reply('list', item.listName);
				}
			},
			{
				id: 'save',
				onPointerPress: () => {
					listi.save();
				}
			},
			{ type: 'div', textContent: `${item.summary ? 'Edit' : 'Create new'} list item` }
		];

		if(item.summary){
			toolkit.splice(toolkit.length - 1, 0, {
				id: 'delete',
				onPointerPress: () => {
					socketClient.reply('list_item_edit', { index: item.index, listName: item.listName, delete: true });
				}
			});
		}

		listi.drawToolkit(toolkit);

		dom.getElemById('list').appendChild(listFragment);

		summaryInput.select();
	},
	draw_list_calendar: function(list){
		var listFragment = dom.createFragment();

		listi.drawToolkit([
			{
				id: 'lists',
				onPointerPress: () => {
					socketClient.reply('list', list.name);
				}
			}
		]);

		listi.calendar = new Calendar();

		list.arr.forEach((item, index) => { if(item.due) listi.calendar.addEvent({ index, label: item.summary, at: item.due }); });

		listi.calendar.on('selectDay', (evt) => {
			listi.draw('list_item_edit', { listName: list.name, due: evt.fullDate });
		});

		listi.calendar.on('selectEvent', (evt) => {
			listi.draw('list_item_edit', Object.assign({ index: evt.index, listName: list.name }, listi.lists[list.name].arr[evt.index]));
		});

		dom.getElemById('toolkit').appendChild(listi.calendar.title);

		listi.calendar.render();

		listFragment.appendChild(dom.createElem('li', { id: 'calendar', className: 'listItem', appendChild: listi.calendar.elem }));

		dom.getElemById('list').appendChild(listFragment);
	},
	draw_filter_edit: function(list){
		listi.drawToolkit([
			{
				id: 'lists',
				onPointerPress: () => {
					socketClient.reply('list', list.name);
				}
			}
		]);
	},
	draw_sort_edit: function(list){
		listi.drawToolkit([
			{
				id: 'lists',
				onPointerPress: () => {
					socketClient.reply('list', list.name);
				}
			}
		]);
	},
	draw_list_item_set_due_date: function(item){
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
	},
	drawToolkit: function(items){
		var toolkitFragment = dom.createFragment();

		items.forEach((opts) => {
			var elemType = 'button';

			if(opts.type){
				elemType = opts.type;

				delete opts.type;
			}

			dom.createElem(elemType, Object.assign({ appendTo: toolkitFragment	}, opts));
		});

		dom.getElemById('toolkit').appendChild(toolkitFragment);
	},
	createTag: function(name){
		return dom.createElem('li', {
			className: 'tag',
			textContent: name,
			onPointerPressAndHold: (evt) => {
				dom.remove(evt.target);
			}
		});
	},
	createTagList: function(list = []){
		return dom.createElem('ul', { className: 'tagList', appendChildren: list.map((name) => { return listi.createTag(name); }) });
	}
};

document.oncontextmenu = (evt) => { evt.preventDefault();	};

dom.onLoad(listi.init);