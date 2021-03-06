const os = require('os');
const path = require('path');

const log = new (require('log'))({ tag: 'listi' });
const SocketServer = require('websocket-server');

const listi = {
	rootPath: function(){ return path.join(__dirname, '../..', ...arguments); },
	init: function(options){
		this.options = options;

		this.lists = new (require('config-manager'))(path.join(os.homedir(), '.listi.json'), {});

		const { app } = require('http-server').init(options.port, this.rootPath(), '/');

		require('./router');

		this.socketServer = new SocketServer({ server: app.server });
		this.socketServer.registerEndpoints(this.socketEndpoints);

		log.info('Initialized');
	},
	socketEndpoints: {
		client_connect: function(){
			log('Client connected');

			this.reply('lists', Object.keys(listi.lists.current));
		},
		lists: function(){
			log('Requested lists');

			this.reply('lists', Object.keys(listi.lists.current));
		},
		list: function(name){
			log(`Requested list: ${name}`);

			this.reply('list', { name, arr: listi.lists.current[name] });
		},
		list_edit: function(list){
			log(`${list.name ? (list.delete ? 'Delete' : 'Edit') : 'Create'} list: ${list.name || list.new.name}`);

			if(!list.name) listi.lists.current[list.new.name] = [];

			else {
				if(!list.delete) listi.lists.current[list.new.name] = listi.lists.current[list.name];

				delete listi.lists.current[list.name];
			}

			if(listi.options.persistent) listi.lists.save();

			this.reply('lists', Object.keys(listi.lists.current));
		},
		list_item_edit: function(item){
			log(`${typeof item.index === 'number' ? (item.delete ? 'Delete' : 'Edit') : 'Create'} list item: ${item.summary || (item.new && item.new.summary) || item.index}`);

			if(item.delete) listi.lists.current[item.listName].splice(item.index, 1);

			else if(typeof item.index === 'number') listi.lists.current[item.listName][item.index] = item.new;

			else listi.lists.current[item.listName].push(item.new);

			if(listi.options.persistent) listi.lists.save();

			this.reply('list', { name: item.listName, arr: listi.lists.current[item.listName] });
		}
	}
};

module.exports = listi;