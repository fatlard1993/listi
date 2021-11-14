import './index.css';

import dom from 'dom';
import socketClient from 'socket-client';

import listi from '../../listi';

import TagList from '../TagList';
import Button from '../Button';

class ListItem {
	constructor({ appendTo, item, listName }) {
		const { index, due: lastDue } = item;

		const dueWrapper = dom.createElem('div');
		let overdue;
		let dueSoon;
		let dueToday;

		if (lastDue) {
			const dueDateDiff = listi.dayDiff(lastDue);

			overdue = dueDateDiff < 0;
			dueSoon = !overdue && dueDateDiff < 7;
			dueToday = dueDateDiff === 0;

			dom.createElem('div', { textContent: `${overdue ? '(Overdue) ' : ''}Due: ${listi.dayCountName(dueDateDiff)} (${item.due})`, className: 'dueDate', appendTo: dueWrapper });
		}

		const handleComplete = () => {
			let action = item.complete?.action;
			const now = new Date();

			listi.log('Complete', item);

			if (action === 'Delete') return socketClient.reply('list_item_edit', { index, listName, remove: true });

			item.lastComplete = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
			item.due = '';

			if (action.includes('Tag')) {
				item.tags = item.tags || [];

				const tagName = item.complete.tagName || 'Complete';
				action = action === 'Toggle Tag' ? (item.tags.includes(tagName) ? 'Remove Tag' : 'Add Tag') : action;

				if (action === 'Add Tag' && !item.tags.includes(tagName)) item.tags.push(tagName);
				else if (action === 'Remove Tag' && item.tags.includes(tagName)) item.tags.splice(item.tags.indexOf(tagName), 1);
			} else if (action === 'Reschedule') {
				let nextDue = new Date((item.complete.base === 'Last Completed' && item.lastComplete ? new Date(item.lastComplete) : new Date(lastDue)).getTime() + item.complete.gap);

				nextDue = `${nextDue.getMonth() + 1}/${nextDue.getDate()}/${nextDue.getFullYear()}`;

				item.due = nextDue;
			}

			socketClient.reply('list_item_edit', { index, listName, update: item });
		};

		this.elem = dom.createElem('li', {
			textContent: item.summary,
			className: `listItem${overdue ? ' overdue' : dueToday ? ' dueToday' : dueSoon ? ' dueSoon' : ''}`,
			appendTo,
			onPointerPress: () => listi.draw('list_item_edit', { index, listName }),
			appendChildren: [
				new Button({
					className: 'complete',
					onPointerPress: handleComplete,
				}),
				dom.createElem('div', { textContent: item.description, className: 'description' }),
				dueWrapper,
			],
		});

		new TagList({ appendTo: this.elem, items: item.tags });

		return this.elem;
	}
}

export default ListItem;
