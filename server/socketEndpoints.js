const { nanoid } = require('nanoid');
const database = require('./database');

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
				filterIds: Object.keys(database.state.filters),
				filters: database.state.filters,
				itemIds: Object.keys(database.state.items),
				items: database.state.items,
			});
		},
		list_item_edit({ remove, index, listName, summary, update }) {
			socketEndpoints.log(`${typeof index === 'number' ? (remove ? 'Delete' : 'Edit') : 'Create'} list item: ${summary || (update && update.summary) || index}`);

			if (remove) database.state.lists[listName].items.splice(index, 1);
			else if (typeof index === 'number') database.state.lists[listName].items[index] = update;
			else database.state.lists[listName].items.push(update);

			database.save();

			this.reply('list_item_edit', { success: true });
		},
		filter_edit({ id, update, remove }) {
			socketEndpoints.log(`${id ? (remove ? 'Delete' : 'Edit') : 'Create'} filter: ${database.state.filters?.[id]?.name || update.name}`);

			if (!id) database.state.filters[nanoid(5)] = { tags: [], name: update.name };
			else {
				if (update?.filter) database.state.filters[id].filter = Object.assign(database.state.lists[id].filter, update.filter);

				if (remove) delete database.state.filters[id];
			}

			database.save();

			this.reply('filter_edit', { success: true });
		},
	},
};

module.exports = socketEndpoints;
