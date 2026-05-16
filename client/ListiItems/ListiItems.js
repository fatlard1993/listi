import { Button, View, List, Elem } from 'vanilla-bean-components';

import { runFilter } from '../api';
import { Content, Toolbar } from '../Layout';
import ItemDialog from '../ItemDialog';

export class ListiItems extends View {
	async render({ itemId } = this.options) {
		super.render();

		this.toolbar = new Toolbar({ appendTo: this });
		this.content = new Content({ appendTo: this });

		if (itemId) {
			new Button({
				appendTo: this.toolbar,
				textContent: 'Home',
				onPointerPress: () => (window.location.hash = `#/listi`),
			});
		}

		new Elem({
			tag: 'h1',
			appendTo: this.toolbar,
			textContent: itemId,
		});

		new Button({
			appendTo: this.toolbar,
			icon: 'add',
			onPointerPress: () => new ItemDialog({ appendTo: document.body }),
		});

		const items = await runFilter(itemId);

		new List({
			appendTo: this.content,
			addClass: 'noStyle',
			items: Object.values(items).map(
				item =>
					new Button({
						textContent: `${item.name}${item.due ? ` - ${new Date(item.due).toLocaleDateString()}` : ''}`,
						onPointerPress: () => console.log(item),
						onContextMenu: event => {
							event.preventDefault();

							new ItemDialog({ item, appendTo: document.body });
						},
					}),
			),
		});
	}
}
