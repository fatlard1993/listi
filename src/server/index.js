#!/usr/bin/env node

const path = require('path');

const yargs = require('yargs');

yargs.parserConfiguration({
	'camel-case-expansion': false
});

yargs.alias({
	h: 'help',
	v: 'verbosity',
	ver: 'version',
	p: 'port',
	P: 'persistent'
});

yargs.boolean(['h', 'ver', 'persistent']);

yargs.default({
	v: 1,
	p: 8080,
	P: true
});

yargs.describe({
	h: 'This',
	v: '<level>',
	p: '<port>',
	P: 'Saves lists to file'
});

const args = yargs.argv;

['_', '$0', 'v', 'p', 'P'].forEach((item) => { delete args[item]; });

const opts = Object.assign(args, { args: Object.assign({}, args), verbosity: Number(args.verbosity) });

const log = new (require('log'))({ tag: 'listi', color: true, defaultVerbosity: opts.verbosity, colorMap: { listi: '\x1b[36m' } });

log(1)('Options', opts);

require('./listi').init(opts);