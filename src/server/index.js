#!/usr/bin/env node

const argi = require('argi');

argi.parse({
	verbosity: {
		type: 'int',
		alias: 'v',
		defaultValue: 1
	},
	port: {
		type: 'int',
		alias: 'p',
		defaultValue: 80
	},
	persistent: {
		type: 'boolean',
		alias: 'P',
		defaultValue: true,
		description: 'Save lists to a file'
	}
});

const options = argi.options.named;
const log = new (require('log'))({ tag: 'listi', color: true, defaultVerbosity: options.verbosity, colorMap: { listi: '\x1b[36m' } });

log(1)('Options', options);

require('./listi').init(options);