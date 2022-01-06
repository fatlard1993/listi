import { nanoid } from 'nanoid';

import database from './database.js';

const filter = {
	create({ ...options }) {
		const id = nanoid(5);

		database.db.data.filters[id] = Object.assign({ id, tags: [] }, options);

		database.db.write();

		return id;
	},
	read({ id } = {}) {
		if (id) return database.db.data.filters[id];

		return {
			filterIds: Object.keys(database.db.data.filters),
			filters: database.db.data.filters,
		};
	},
	update({ id, update }) {
		database.db.data.filters[id] = Object.assign(database.db.data.filters[id], update);

		database.db.write();

		return id;
	},
	remove({ id }) {
		delete database.db.data.filters[id];

		database.db.write();

		return id;
	},
};

export default filter;
