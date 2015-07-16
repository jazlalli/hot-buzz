#!/usr/bin/env node
var os = require('os');
var config = require('boring-config')('config.cson');
if (config.isProduction) {
	config.alerts.enabled = true;
}

var emailOptions = {
	content: {
		host: os.hostname(),
		timestamp: new Date()
	}
};

var Agenda = require('agenda'),
		consumeFeeds = require('./workers/feedconsumer'),
		rankProducts = require('./workers/productranker'),
		utils = require('./lib/utils'),
		notify = require('./lib/notifications/email')(config.alerts);

var mongoUrl = 'mongodb://127.0.0.1:27017/OnlineWednesday',
		agenda = new Agenda({db: {address: mongoUrl, collection: 'jobs'}});

agenda.purge(function (err, num) {
	if (err) {
		log('job purge error');
	}
});

agenda.define('consume feeds', function (job, done) {
	log('=> feedconsumer started');
	emailOptions.content.subject = 'feedconsumer notification';

	consumeFeeds(function (err) {
		if (err) {
			emailOptions.alertType = 'error';
			emailOptions.content.heading = 'feedconsumer.js status: FAILED';
			emailOptions.content.body = err.stack;
		} else {
			emailOptions.alertType = 'success';
			emailOptions.content.heading = 'feedconsumer.js status: SUCCESS';
		}

		notify.sendEmail(emailOptions, err, function () {
			log('=> feedconsumer done');
			done(err);
		});
	});
});

agenda.define('rank products', function (job, done) {
	log('=> productranker started');

	rankProducts(function (err) {
		if (err) {
			emailOptions.alertType = 'error';
			emailOptions.content.heading = 'productranker.js status: FAILED';
			emailOptions.content.body = err.stack;
		} else {
			emailOptions.alertType = 'success';
			emailOptions.content.heading = 'productranker.js status: SUCCESS';
		}

		notify.sendEmail('productranker', err, function () {
			log('=> productranker done');
			done(err);
		});
	});
});

agenda.every(config.schedule.feedConsumer, 'consume feeds');

agenda
	.schedule(config.schedule.productRanker, 'rank products')
	.repeatEvery('6 hours')
	.save();

process.on('uncaughtException', function (err) {
	var options = {
		alertType: 'error',
		content: {
			heading: 'backgroundworker.js status: FAILED',
			subject: 'OW backgroundworker error',
			body: err.stack,
			host: os.hostname(),
			timestamp: new Date()
		}
	};

	notify.sendEmail(options);
});

agenda.start();