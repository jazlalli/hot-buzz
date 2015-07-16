var request = require('../../patches/requestPatch'),
		db = require('../../data'),
		Product = require('../../data/models/product'),
		defaultStrategy = require('../../lib/consumer/defaultFeedStrategy');

var VergeConsumer = function VergeConsumer() {};
VergeConsumer.prototype = Object.create(defaultStrategy.prototype);

VergeConsumer.prototype.execute = function (feed, callback) {

	requestFeed(feed.url, function (err, data) {
		var products = data.results.collection1;

		// map and save
		var productsCollection = mapData(products);
		saveProducts(productsCollection);

		callback(null, productsCollection);
	});
}

var requestFeed = function requestFeed(url, callback) {
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

var mapData = function mapData(products) {
	var result = [];

	products.forEach(function (p) {
		var product = {};

		product.url = p.product.href;
		product.title = p.brand.text + ' ' + p.product.text;
		product.image = p.image['data-original'];
		product.site = 'verge';
		product.published = new Date();

		result.push(product);
	});

	return result;
}

var saveProducts = function saveProducts(products) {
	products.forEach(function (product) {

		Product.upsert(product, function (err) {
			if (err) {
				console.log('VERGE PRODUCT SAVE ERROR', err);
			} else {
				console.log('SAVED PRODUCT:', product.title);
			}
		});
	});
}

module.exports = VergeConsumer;