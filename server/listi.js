const os = require('os');
const path = require('path');

const express = require('express');
const { Log } = require('log');

const log = new Log({ tag: 'listi' });
const WebsocketServer = require('websocket-server');

const { port } = require('../constants.json');

const listi = {
	rootPath() {
		return path.join(__dirname, '..', ...arguments);
	},
	init(options) {
		this.options = options;

		this.config = new (require('config-manager'))(path.join(os.homedir(), '.listi.json'), {});

		if (!this.config.current.lists) this.config.current.lists = {};

		this.app = express();

		this.server = this.app.listen(port, () => log(`Server listening on port: ${port}`));

		require('./router');

		this.socketServer = new WebsocketServer({ server: this.server });
		this.socketServer.registerEndpoints(this.socketEndpoints);

		log.info('Initialized');
	},
	socketEndpoints: {
		client_connect() {
			log(3)('Client connected');

			this.reply('connected', true);
		},
		request_state() {
			log(3)('Requested state');

			this.reply('state', { listNames: Object.keys(listi.config.current.lists), lists: listi.config.current.lists });
		},
		list_edit({ listName, update, remove }) {
			log(`${listName ? (remove ? 'Delete' : 'Edit') : 'Create'} list: ${listName || update.listName}`);

			if (!listName) listi.config.current.lists[update.listName] = { filter: {}, items: [] };
			else {
				if (update) {
					listi.config.current.lists[update.listName] = listi.config.current.lists[listName];

					if (update.filter) listi.config.current.lists[update.listName].filter = Object.assign(listi.config.current.lists[update.listName].filter, update.filter);
				}

				if (remove || (update && update.listName && listName !== update.listName)) delete listi.config.current.lists[listName];
			}

			if (listi.options.persistent) listi.config.save();

			this.reply('list_edit', { success: true });
		},
		list_item_edit({ remove, index, listName, summary, update }) {
			log(`${typeof index === 'number' ? (remove ? 'Delete' : 'Edit') : 'Create'} list item: ${summary || (update && update.summary) || index}`);

			if (remove) listi.config.current.lists[listName].items.splice(index, 1);
			else if (typeof index === 'number') listi.config.current.lists[listName].items[index] = update;
			else listi.config.current.lists[listName].items.push(update);

			if (listi.options.persistent) listi.config.save();

			this.reply('list_item_edit', { success: true });
		},
	},
};

module.exports = listi;
