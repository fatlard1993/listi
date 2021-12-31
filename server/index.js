#!/usr/bin/env node

const os = require('os');
const path = require('path');

const { Log } = require('log');
const argi = require('argi');

const { options } = argi.parse({
	verbosity: {
		type: 'number',
		alias: 'v',
		defaultValue: 1,
	},
	persistent: {
		type: 'boolean',
		alias: 'P',
		defaultValue: true,
		description: 'Save lists to a file',
	},
	database: {
		type: 'string',
		alias: 'd',
		defaultValue: path.join(os.homedir(), '.listi.json'),
		description: 'Database json file to use',
	},
});

const log = new Log({ tag: 'listi', defaults: { verbosity: options.verbosity, color: true }, colorMap: { listi: '\x1b[36m' } });

log(1)('Options', options);

require('./listi').init({ log, options });

require('./exit').init({ log });
