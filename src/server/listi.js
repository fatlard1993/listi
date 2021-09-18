const os = require('os');
const path = require('path');

const log = new (require('log'))({ tag: 'listi' });
const SocketServer = require('websocket-server');

const listi = {
	rootPath: function () {
		return path.join(__dirname, '../..', ...arguments);
	},
	init: function (options) {
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
		client_connect: function () {
			log('Client connected');

			this.reply('lists', Object.keys(listi.config.current.lists));
		},
		lists: function () {
			log('Requested lists');

			this.reply('lists', Object.keys(listi.config.current.lists));
		},
		list: function (name) {
			log(`Requested list: ${name}`);

			this.reply('list', { name, list: listi.config.current.lists[name] });
		},
		list_edit: function ({ remove, name, new: newList }) {
			log(`${name ? (remove ? 'Delete' : 'Edit') : 'Create'} list: ${name || newList.name}`);

			if (!name) listi.config.current.lists[newList.name] = { filter: {}, list: [] };
			else {
				if (!remove) {
					listi.config.current.lists[newList.name] = listi.config.current.lists[name];

					if (newList.filter) listi.config.current.lists[newList.name].filter = Object.assign(listi.config.current.lists[newList.name].filter, newList.filter);
				}

				delete listi.config.current.lists[name];
			}

			if (listi.options.persistent) listi.config.save();

			this.reply('lists', Object.keys(listi.config.current.lists));
		},
		list_item_edit: function ({ remove, index, listName, summary, new: newItem }) {
			log(`${typeof index === 'number' ? (remove ? 'Delete' : 'Edit') : 'Create'} list item: ${summary || (newItem && newItem.summary) || index}`);

			if (remove) listi.config.current.lists[listName].items.splice(index, 1);
			else if (typeof index === 'number') listi.config.current.lists[listName].items[index] = newItem;
			else listi.config.current.lists[listName].items.push(newItem);

			if (listi.options.persistent) listi.config.save();

			this.reply('list', { name: listName, list: listi.config.current.lists[listName] });
		},
	},
};

module.exports = listi;
