const Config = require('config-manager');

const database = {
	default: {
		filters: {},
	},
	init({ persistent, path }) {
		const config = new Config(path, database.default);

		database.state = config.current;
		database.save = persistent ? config.save : () => {};
	},
};

module.exports = database;
