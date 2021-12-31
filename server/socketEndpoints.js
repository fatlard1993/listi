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
				filterNames: Object.keys(database.state.filters),
				filters: database.state.filters,
			});
		},
		list_edit({ listName, update, remove }) {
			socketEndpoints.log(`${listName ? (remove ? 'Delete' : 'Edit') : 'Create'} list: ${listName || update.listName}`);

			if (!listName) database.state.lists[update.listName] = { filter: {}, items: [] };
			else {
				if (update) {
					database.state.lists[update.listName] = database.state.lists[listName];

					if (update.filter) database.state.lists[update.listName].filter = Object.assign(database.state.lists[update.listName].filter, update.filter);
				}

				if (remove || (update && update.listName && listName !== update.listName)) delete database.state.lists[listName];
			}

			database.save();

			this.reply('list_edit', { success: true });
		},
		list_item_edit({ remove, index, listName, summary, update }) {
			socketEndpoints.log(`${typeof index === 'number' ? (remove ? 'Delete' : 'Edit') : 'Create'} list item: ${summary || (update && update.summary) || index}`);

			if (remove) database.state.lists[listName].items.splice(index, 1);
			else if (typeof index === 'number') database.state.lists[listName].items[index] = update;
			else database.state.lists[listName].items.push(update);

			database.save();

			this.reply('list_item_edit', { success: true });
		},
		filter_edit({ name, update, remove }) {
			socketEndpoints.log(`${name ? (remove ? 'Delete' : 'Edit') : 'Create'} filter: ${name || update.name}`);

			if (!name) database.state.filters[update.name] = { tags: [] };
			else {
				if (update) {
					database.state.filters[update.name] = database.state.filters[name];

					if (update.filter) database.state.filters[update.name].filter = Object.assign(database.state.lists[update.name].filter, update.filter);
				}

				if (remove || (update && update.name && name !== update.name)) delete database.state.filters[name];
			}

			database.save();

			this.reply('filter_edit', { success: true });
		},
	},
};

module.exports = socketEndpoints;
