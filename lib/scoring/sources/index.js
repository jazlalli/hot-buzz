var fs = require('fs'),
		modules = {};

var providers = fs.readdirSync(__dirname);

providers.forEach(function (p) {
	p = p.split('.')[0];

	if (p !== 'index') {
		modules[p] = require('./' + p);
	}
});

module.exports = modules;