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

var logAndDie = function(reason){
	log(reason)
	process.exit(1)
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
	Product.find({type: null}, function(err, products) {
		if ( err ){ return logAndDie('Error finding products:'+err)}
		var productsToFix = products.length
		log('Found', productsToFix, 'products with no type')

		products.forEach(function(product){
			product.type = 'technology'
			product.save(function(err, updatedProduct, numberAffected){
				if ( err ){ return logAndDie('Error setting type for product:'+err)}
				log('Set type for product', product._id, product.title)
				log(productsToFix, 'products left')
				productsToFix--;
				if ( ! productsToFix ) {
					log('Complete')
					process.exit(0)
				}
			})
		})
	})
})