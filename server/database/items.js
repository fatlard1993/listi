import { nanoid } from 'nanoid';

import database from '.';

const items = {
	get data() {
		return database.db.data.items;
	},
	create(data) {
		const id = nanoid(6);
		const newItem = { ...data, id };

		items.data[id] = newItem;

		database.db.write();

		return newItem;
	},
	read({ id, dereference, topLevel } = {}) {
		if (id && dereference) return items.dereference({ id });
		if (id) return items.data[id] || false;

		if (topLevel) {
			const topLevelIds = new Set();
			const children = {};

			Object.values(items.data)
				.map(item => {
					if (!item.items?.length) return item.id;

					item.items.forEach(id => {
						if (!children[id]) children[id] = items.data[id];
					});

					return item.id;
				})
				.forEach(_id => {
					if (!children[_id]) topLevelIds.add(_id);
				});

			return dereference ? items.dereference({ ids: [...topLevelIds] }) : Object.fromEntries([...topLevelIds].map(_id => [_id, items.data[_id]]));
		}

		if (dereference) return items.dereference({ ids: Object.keys(items.data) });

		return items.data;
	},
	dereference({ id, ids }) {
		if (ids) return Object.fromEntries(ids.map(_id => [_id, items.dereference({ id: _id })]));
		if (!items.data[id]) return false;

		return { ...items.data[id], items: items.data[id].items?.map(item => items.dereference({ id: item })) };
	},
	update({ id, update }) {
		if (!items.data[id]) return false;

		const newItem = { ...items.data[id], ...update };

		items.data[id] = newItem;

		database.db.write();

		return newItem;
	},
	delete({ id }) {
		if (!items.data[id]) return false;

		delete items.data[id];

		database.db.write();

		return true;
	},
};

export default items;
