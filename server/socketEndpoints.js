import filter from './filter.js';
import item from './item.js';

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

			this.reply('state', { ...filter.read(), ...item.read() });
		},
		item_edit({ id, remove = false, update = {} }) {
			socketEndpoints.log(`${typeof index === 'number' ? (remove ? 'Delete' : 'Edit') : 'Create'} item: ${update.summary || id}`);

			if (id === 'new' && update.name) id = item.create({ update });
			else if (update) id = item.update({ id, update });
			else if (remove) id = item.remove({ id });

			this.reply('item_edit', { success: true, id });
		},
		filter_edit({ id, update, remove }) {
			socketEndpoints.log(`${id ? (remove ? 'Delete' : 'Edit') : 'Create'} filter: ${filter.read({ id })?.name || update.name}`);

			if (id === 'new' && update.name) id = filter.create(update);
			else if (update) id = filter.update({ id, update });
			else if (remove) id = filter.remove({ id });

			this.reply('filter_edit', { success: true, id });
		},
	},
};

export default socketEndpoints;
