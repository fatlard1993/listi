#!/usr/bin/env node

import os from 'os';
import path from 'path';

import { Log } from 'log';
import argi from 'argi';

import listi from './listi.js';
import exit from './exit.js';

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

listi.init({ log, options });

exit.init({ log });
