import { nanoid } from 'nanoid';

import database from './database.js';

const socketEndpoints = {
	init({ log, socketServer }) {
		socketEndpoints.log = log;

		socketServer.registerEndpoints(socketEndpoints.endpoints);
	},
	endpoints: {
		client_connect() {
			socketEndpoints.log(3)('Client connected');

			this.reply('connected', true);
		},
		request_state() {
			socketEndpoints.log(3)('Requested state');

			this.reply('state', {
				filterIds: Object.keys(database.db.data.filters),
				filters: database.db.data.filters,
				itemIds: Object.keys(database.db.data.items),
				items: database.db.data.items,
			});
		},
		item_edit({ id, remove = false, update = {} }) {
			socketEndpoints.log(`${typeof index === 'number' ? (remove ? 'Delete' : 'Edit') : 'Create'} item: ${update.summary || id}`);

			if (id === 'new' && update.summary) {
				id = nanoid(5);
				database.db.data.items[id] = Object.assign({ id, tags: [] }, update);
			} else if (remove) delete database.db.data.items[id];
			else if (update) database.db.data.items[id] = Object.assign(database.db.data.items[id], update);

			database.db.write();

			this.reply('item_edit', { success: true, id });
		},
		filter_edit({ id, update, remove }) {
			socketEndpoints.log(`${id ? (remove ? 'Delete' : 'Edit') : 'Create'} filter: ${database.db.data.filters?.[id]?.name || update.name}`);

			if (id === 'new' && update.name) {
				id = nanoid(5);
				database.db.data.filters[id] = Object.assign({ id, tags: [] }, update);
			} else if (remove) delete database.db.data.filters[id];
			else if (update) database.db.data.filters[id] = Object.assign(database.db.data.filters[id], update);

			database.db.write();

			this.reply('filter_edit', { success: true });
		},
	},
};

export default socketEndpoints;
