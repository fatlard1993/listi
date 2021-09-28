const os = require('os');
const path = require('path');

const log = new (require('log'))({ tag: 'listi' });
const SocketServer = require('websocket-server');

const listi = {
	rootPath() {
		return path.join(__dirname, '../..', ...arguments);
	},
	init(options) {
		this.options = options;

		this.config = new (require('config-manager'))(path.join(os.homedir(), '.listi.json'), {});

		if (!this.config.current.lists) this.config.current.lists = {};

		const { app } = require('http-server').init(this.config.current.port || options.port, this.rootPath(), '/');

		require('./router');

		this.socketServer = new SocketServer({ server: app.server });
		this.socketServer.registerEndpoints(this.socketEndpoints);

		log.info('Initialized');
	},
	socketEndpoints: {
		client_connect() {
			log('Client connected');

			this.reply('connected', true);
		},
		lists() {
			log('Requested lists');

			this.reply('lists', { listNames: Object.keys(listi.config.current.lists), lists: listi.config.current.lists });
		},
		list(name) {
			log(`Requested list: ${name}`);

			this.reply('list', { name, ...listi.config.current.lists[name] });
		},
		list_edit({ name, update, remove }) {
			log(`${name ? (remove ? 'Delete' : 'Edit') : 'Create'} list: ${name || update.name}`);

			if (!name) listi.config.current.lists[update.name] = { filter: {}, items: [] };
			else {
				if (update) {
					listi.config.current.lists[update.name] = listi.config.current.lists[name];

					if (update.filter) listi.config.current.lists[update.name].filter = Object.assign(listi.config.current.lists[update.name].filter, update.filter);
				}

				if (remove || (update && update.name && name !== update.name)) delete listi.config.current.lists[name];
			}

			if (listi.options.persistent) listi.config.save();

			this.reply('lists', Object.keys(listi.config.current.lists));
		},
		list_item_edit({ remove, index, listName, summary, update }) {
			log(`${typeof index === 'number' ? (remove ? 'Delete' : 'Edit') : 'Create'} list item: ${summary || (update && update.summary) || index}`);

			if (remove) listi.config.current.lists[listName].items.splice(index, 1);
			else if (typeof index === 'number') listi.config.current.lists[listName].items[index] = update;
			else listi.config.current.lists[listName].items.push(update);

			if (listi.options.persistent) listi.config.save();

			this.reply('list', { name: listName, ...listi.config.current.lists[listName] });
		},
	},
};

module.exports = listi;
