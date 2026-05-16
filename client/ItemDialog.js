import { Dialog, Input, Label, conditionalList } from 'vanilla-bean-components';

import { createItem, deleteItem, updateItem } from './api';

export default class ItemDialog extends Dialog {
	constructor({ item, ...options }) {
		const nameInput = new Input({ type: 'text', value: item?.name || '', validations: [[/.+/, 'Required']] });

		super({
			size: 'large',
			header: `${item ? 'Edit' : 'Create'} Item${item ? ` | ${item.name}` : ''}`,
			body: [new Label('Name', nameInput)],
			buttons: conditionalList([{ alwaysItem: 'Save' }, { if: item, thenItem: 'Delete' }, { alwaysItem: 'Cancel' }]),
			onButtonPress: ({ button }) => {
				if (button === 'Save') {
					const validationErrors = [...nameInput.validate()];

					if (validationErrors.length > 0) return;

					if (item) {
						updateItem(item.id, { body: { name: nameInput.elem.value } }).then(() => {
							console.log('router?.renderView()');
						});
					} else {
						createItem({ body: { name: nameInput.elem.value } }).then(() => {
							console.log('router?.renderView()');
						});
					}
				} else if (button === 'Delete') {
					deleteItem(item.id).then(() => {
						console.log('router?.renderView()');
					});
				}

				this.close();
			},
			...options,
		});
	}
}
