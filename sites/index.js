var boringConfig = require('boring-config'),
		fs = require('fs'),
		utils = require('../lib/utils')

var config = boringConfig('config.cson')
var sites = {};
var plugins = fs.readdirSync(__dirname);
var enabledSites = Object.keys(config.feeds);

plugins.forEach(function (plugin) {
	var scraper, feedConsumer;

	if (enabledSites.indexOf(plugin) > -1) {
		console.log('Feed for site', plugin, 'enabled');
		feedConsumer = require(__dirname + '/' + plugin + '/feedStrategy');
		sites[plugin] = {
			consumer: new feedConsumer()
		}
	}
});

module.exports = sites;