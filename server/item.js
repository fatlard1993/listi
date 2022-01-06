import { nanoid } from 'nanoid';

import database from './database.js';

const item = {
	create({ options }) {
		const id = nanoid(5);

		database.db.data.items[id] = Object.assign({ id, tags: [] }, options);

		database.db.write();

		return id;
	},
	read({ id } = {}) {
		if (id) return database.db.data.items[id];

		return {
			itemIds: Object.keys(database.db.data.items),
			items: database.db.data.items,
		};
	},
	update({ id, update }) {
		database.db.data.items[id] = Object.assign(database.db.data.items[id], update);

		database.db.write();

		return id;
	},
	remove({ id }) {
		delete database.db.data.items[id];

		database.db.write();

		return id;
	},
};

export default item;
