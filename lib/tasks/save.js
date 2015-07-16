var Product = require('../../data/models/product');

var i = 0;

module.exports = function (product, callback) {

	Product.upsert(product, function (err) {
		if (err) {
			console.log('SAVE ERROR', err, product);
			callback(err);
		} else {
			console.log('===>>>', ++i, 'SAVED', product.url);
			callback();
		}
	});
};