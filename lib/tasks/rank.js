var async = require('async'),
    scoring = require('../scoring');

function updateShareHistory(score, scoreHistory) {
	var nowTimestamp = (new Date().getTime());
	var day = 1000 * 60 * 60 * 24;
	var todayTimestamp = nowTimestamp - (nowTimestamp % day);

	var existing = scoreHistory.filter(function (elm, idx) {
		var elmTimestamp = new Date(elm.date).getTime();
		return elmTimestamp < todayTimestamp;
	});

	existing.push({date: new Date(todayTimestamp), count: score});
	return existing;
}

var i = 0;

module.exports = function (product, callback) {
	async.parallel([
		function (cb) {
			scoring.getPrimaryShareCount(product.url, function (err, sharecount) {
				if (err) {
					cb(err);
				} else {
					product.primaryShareData = updateShareHistory(sharecount, product.primaryShareData);
					cb(null, product);
				}
			});
		},
		function (cb) {
			scoring.getSecondaryShareCount(product.title, function (err, sharecount) {
				if (err) {
					cb(err);
				} else {
					product.secondaryShareData = updateShareHistory(sharecount, product.secondaryShareData);
					cb(null, product);
				}
			});
		}
	], function (err, products) {
		if (err) {
			console.log(err);
			callback(err);
		} else {

			console.log('===>>>', ++i, 'DONE RANKING', products[0].url);

			// copy result from 2nd function to 1st
			products[0].secondaryShareData = products[1].secondaryShareData;
			callback(null, products[0]);
		}
	});
};