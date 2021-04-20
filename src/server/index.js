#!/usr/bin/env node

const argi = require('argi');

const { options } = argi.parse({
	verbosity: {
		type: 'number',
		alias: 'v',
		defaultValue: 1
	},
	port: {
		type: 'number',
		alias: 'p',
		defaultValue: 11571
	},
	persistent: {
		type: 'boolean',
		alias: 'P',
		defaultValue: true,
		description: 'Save lists to a file'
	}
});

const log = new (require('log'))({ tag: 'listi', defaults: { verbosity: options.verbosity, color: true }, colorMap: { listi: '\x1b[36m' } });

log(1)('Options', options);

require('./listi').init(options);