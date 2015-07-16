#!/usr/bin/env node
module.exports = exports = run;

global.log = console.log.bind(console)
var config = require('boring-config')('config.cson');
if (config.isProduction) {
	config.alerts.enabled = true;
}

var os = require('os'),
		async = require('async'),
		plugins = require('../sites'),
		consumer = require('../lib/consumer'),
		notify = require('../lib/notifications/email')(config.alerts);

// parse feeds.json to work queues
function buildFeedList() {
	var feedArray = [];

	for (var site in config.feeds) {
		feedArray.push({site: site, url: config.feeds[site].url});
	}

	return feedArray;
}

function consumeFeed(feed, cb) {
	if (plugins[feed.site]) {
		consumer.use(plugins[feed.site].consumer);
		consumer.consume(feed, function (err, items) {
			if (err) {
				cb(err);
			} else {
				cb(null, items);
			}
		});
	} else {
		cb();
	}
}

// main
function run(finishedCb) {
	var feedList = buildFeedList();

	// https://github.com/caolan/async#mapLimit
	async.mapLimit(feedList, 1, consumeFeed, finishedCb);
}

// for debug purposes, allows you to run this worker on demand
if ( process.argv[1].indexOf('feedconsumer') !== -1 ) {
	process.on('uncaughtException', function (err) {
		var options = {
			alertType: 'error',
			content: {
				subject: 'feedconsumer uncaughtException',
				heading: 'feedconsumer status: FAILED',
				body: err.stack,
				host: os.hostname(),
				timestamp: new Date()
			}
		};

		notify.sendEmail(options, function () {
			process.exit(1);
		});
	});


	run(function (err, items) {
		var itemCount;
		var emailOptions = {
			content: {
				subject: 'feedconsumer notification',
				host: os.hostname(),
				timestamp: new Date()
			}
		};

		if (err) {
			emailOptions.alertType = 'error';
			emailOptions.content.heading = 'feedconsumer.js status: FAILED';
			emailOptions.content.body = err.stack;
		} else {

			itemCount = items.map(function (i) {
				var count = i ? i.length : 0;
				return count;
			}).reduce(function (prev, curr) {
				return prev + curr;
			});

			emailOptions.alertType = 'success';
			emailOptions.content.heading = 'feedconsumer.js status: SUCCESS';
			emailOptions.content.body = 'Processed ' + itemCount + ' feed items';
		}

		notify.sendEmail(emailOptions, function () {
			process.exit(1);
		});
	});
}