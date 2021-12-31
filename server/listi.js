const express = require('express');
const WebsocketServer = require('websocket-server');

const { port } = require('../constants.json');
const database = require('./database');
const router = require('./router');
const socketEndpoints = require('./socketEndpoints');

const listi = {
	init({ log, options }) {
		const app = express();
		const server = app.listen(port, () => log(`Server listening on port: ${port}`));
		const socketServer = new WebsocketServer({ server });

		router.init({ express, app });
		socketEndpoints.init({ log, socketServer });
		database.init({ persistent: options.persistent, path: options.database });
	},
};

module.exports = listi;
