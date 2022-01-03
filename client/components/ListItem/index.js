import './index.css';

import socketClient from 'socket-client';

import router from '../../router';
import utils from '../../utils';

import DomElem from '../DomElem';
import TagList from '../TagList';
import IconButton from '../IconButton';
import state from '../../state';

export default class ListItem extends DomElem {
	constructor({ appendTo, className, id }) {
		const { dayDiff, dayCountName } = utils;
		const item = state.listItems[id];
		const { due: lastDue } = item;

		const dueWrapper = new DomElem('div');
		let overdue;
		let dueSoon;
		let dueToday;

		if (lastDue) {
			const dueDateDiff = dayDiff(lastDue);

			overdue = dueDateDiff < 0;
			dueSoon = !overdue && dueDateDiff < 7;
			dueToday = dueDateDiff === 0;

			new DomElem('div', { textContent: `${overdue ? '(Overdue) ' : ''}Due: ${dayCountName(dueDateDiff)} (${item.due})`, className: 'dueDate', appendTo: dueWrapper });
		}

		const handleComplete = () => {
			let action = item.complete?.action;
			const now = new Date();

			// log('Complete', item);

			if (action === 'Delete') return socketClient.reply('list_item_edit', { id, remove: true });

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

			socketClient.reply('list_item_edit', { id, update: item });
		};

		super('li', {
			className: ['listItem', overdue && 'overdue', dueToday && 'dueToday', dueSoon && 'dueSoon', className],
			appendTo,
			onPointerPress: () => {
				router.path = router.routeToPath(router.ROUTES.listItemEdit, { id });
			},
			appendChildren: [
				new DomElem('div', {
					className: 'content',
					appendChildren: [
						new DomElem('h2', {
							className: 'listItemTitle',
							textContent: item.summary,
						}),
						new DomElem('div', { textContent: item.description, className: 'description' }),
						dueWrapper,
						new TagList({ tags: item.tags }),
					],
				}),
				new IconButton({
					icon: 'check',
					onPointerPress: handleComplete,
				}),
			],
		});
	}
}
