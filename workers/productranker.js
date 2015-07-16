#!/usr/bin/env node
module.exports = exports = run;

global.log = console.log.bind(console)
var config = require('boring-config')('config.cson');
if (config.isProduction) {
	config.alerts.enabled = true;
}

var os = require('os'),
		db = require('../data'),
		async = require('async'),
		Product = require('../data/models/product'),
		rank = require('../lib/tasks/rank'),
		save = require('../lib/tasks/save'),
		notify = require('../lib/notifications/email')(config.alerts);

function getProductData(product, cb) {
	rank(product, function (err, product) {
		if (err) {
			cb(err);
		} else {
			save(product, function (err) {
				if (err) {
					cb(err);
				} else {
					cb(null, product);
				}
			});
		}
	})
}

// main
function run(finishedCb) {
	Product.getRecent(function (err, products) {

		products = products.filter(function (product) {
			return (Boolean(product.url) && Boolean(product.site));
		});

		// https://github.com/caolan/async#mapLimit
		async.mapLimit(products, 5, getProductData, finishedCb);
	});
}

// Run immediately if invoked directly
if ( process.argv[1].indexOf('productranker') !== -1 ) {
	var start = new Date().getTime();

	process.on('uncaughtException', function (err) {
		var options = {
			alertType: 'error',
			content: {
				subject: 'productranker uncaughtException',
				heading: 'productranker status: FAILED',
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
		var now = new Date().getTime();
		var secs = (now - start) / 1000;
		var span = parseInt(secs / 60, 10) + 'mins ' + (secs % 60) + 'secs';
		var itemCount;

		log('finished in', span);

		var emailOptions = {
			content: {
				subject: 'productranker notification',
				host: os.hostname(),
				timestamp: new Date()
			}
		};

		if (err) {
			emailOptions.alertType = 'error';
			emailOptions.content.heading = 'productranker.js status: FAILED';
			emailOptions.content.body = err.stack;
		} else {

			itemCount = items.length;
			emailOptions.alertType = 'success';
			emailOptions.content.heading = 'productranker.js status: SUCCESS';
			emailOptions.content.body = 'Processed ' + itemCount + ' feed items';
		}

		notify.sendEmail(emailOptions, function () {
			process.exit(1);
		});
	});
}