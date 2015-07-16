var request = require('../../patches/requestPatch'),
		db = require('../../data'),
		Product = require('../../data/models/product'),
		dataUtils = require('../../data/utils/');
		defaultStrategy = require('../../lib/consumer/defaultFeedStrategy');

var PorterConsumer = function PorterConsumer() {};
PorterConsumer.prototype = Object.create(defaultStrategy.prototype);

PorterConsumer.prototype.execute = function (feed, callback) {
	log('execute', feed)
	requestFeed(feed.url, function (err, data) {
		var products = data.results.collection1;

		// map and save
		var productsCollection = mapData(products);
		saveProducts(productsCollection);

		callback(null, productsCollection);
	});
}

var requestFeed = function (url, callback) {
	log('requestFeed', url)
	var options = {
		url: url,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml'
		}
	};

	var requestCallback = function requestCallback(err, res, body) {
		if (err) {
			console.log('REQUEST ERROR', err);
			callback(err);
		} else {
			callback(null, JSON.parse(body));
		}
	};

	request(options, requestCallback);
}

// Turn scraped data into correct format for OW
var mapData = function (scrapedProducts) {

	var results = [];

	scrapedProducts.forEach(function (scrapedProduct) {
		var product = {};

		// Porter Magazine puts most of the interesting stuff under 'image'
		var usefulStuff = scrapedProduct.image
		product.url = usefulStuff.href;
		product.title = usefulStuff.alt;
		product.image = usefulStuff.src;
		product.site = 'porter';
		product.type = 'fashion';
		product.published = new Date();
		results.push(product);
	});

	return results;
}

var saveProducts = function saveProducts(products) {
	products.forEach(function (product) {
		Product.upsert(product, function (err) {
			if (err) {
				console.log('PORTER PRODUCT SAVE ERROR');
			} else {
				console.log('SAVED PRODUCT:', product.title);
			}
		});
	});
}

module.exports = PorterConsumer;