#!/usr/bin/env node
// Fixes older products, created befoore there were different tpyes of product

var log = console.log.bind(console)

var path = require('path'),
	TOP_LEVEL_DIR = path.join(__dirname, '../'),
	utils = require(path.join(TOP_LEVEL_DIR, 'lib/utils.js')),
	boringConfig = require('boring-config'),
	mongoose = require('mongoose'),
	Product = require( path.join(TOP_LEVEL_DIR, 'data/models/product.js') );

var config = boringConfig('config.cson');
var DAY = 24 * 60 * 60 * 1000;

var logAndDie = function(reason){
	log(reason)
	process.exit(1)
}

var generateScore = function (upperLimit) {
	return Math.floor(Math.random() * (upperLimit + 1));
}

// Note this isn't passed around explicitly, but still required for Mongoose queries to work.
var mongoURL = 'mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.name
mongoose.connect(mongoURL, function(err) {
	if (err) {
		log('Could not connect to MongoDB database', config.mongodb.name, 'on', config.mongodb.host, config.mongodb.port)
		log("You might have forgotten to run 'mongod'.")
		process.exit(1);
	}
});

mongoose.connection.on('open', function(){
	log('Opened connection to', mongoURL)

	Product.find({}, function (err, products) {
		if ( err ){ return logAndDie('Error finding products:'+err)}

		log('Generating some scores for', products.length, 'products')

		products.forEach(function (product) {
			product.primaryShareData = [];
			product.secondaryShareData = [];

			var now = new Date().getTime();

			for (var i = 0; i < 10; i++) {
				var today = new Date((now - (i * DAY) - (now % DAY))).getTime();
				product.primaryShareData.push({
					date: new Date(today),
					count: generateScore(50)
				});

				product.secondaryShareData.push({
					date: new Date(today),
					count: generateScore(3000)
				});
			}

			product.save(function (err){
				if (err){
					return logAndDie('Error setting type for product:'+err);
				}

				log('Generated scores for', product.title);
			});
		})
	})
})