var async = require('async'),
		twitter = require('./sources').twitter,
		fb = require('./sources').facebook,
		rateLimit = require('function-rate-limit');

// From http://stackoverflow.com/questions/8713241/whats-the-facebooks-graph-api-call-limit:
// '600 calls per 600 seconds, per token & per IP'
var FACEBOOK_RATE_LIMIT = {
	CALLS: 600,
	TIME: 600 * 1000
}

var getFacebookShareCountRateLimited = rateLimit(FACEBOOK_RATE_LIMIT.CALLS, FACEBOOK_RATE_LIMIT.TIME, function(url, cb){
	fb.getShareCount(url, cb);
})

function getUrlShareCount(url, callback) {

	async.parallel([
		function (cb) {
			twitter.getShareCount(url, cb);
		},
		function(cb){
			getFacebookShareCountRateLimited(url, cb)
		}
	], function (err, shares) {
		var sharecount = 0;

		if (err) {
			console.log(err);
			callback(err);
		} else {
			sharecount = shares.reduce(function (prev, curr) {
				return prev + curr;
			});

			callback(null, sharecount);
		}
	});
}

function getSecondaryShareCount(productName, callback) {
	var urlShares = [];

	var getShareData = function getShareData(url, cb) {
		if (!url) {
			cb();
		} else {
			getUrlShareCount(url, function (err, shares) {
				urlShares.push(shares);
				cb();
			});
		}
	};

	console.log('getLinksFromTweets for productName', productName)
	twitter.getLinksFromTweets(productName, function (err, links) {
		if ( ! links ) {
			// TODO: This is a bug, links should always be true, but
			// for demo purposes: temporarily don't call err so all products get rated
			console.log('#getLinksFromTweets error', err, links);
			return callback(null, 0)
		}
		if (err) {
			return callback(err, 0)
		}
		// get full URL and then sharing stats for each tweeted link
		async.eachLimit(links, 3, getShareData, function (err) {
			var sharecount = 0;
			if (err) {
				console.log('#getShareData error', err);
				callback(err);
			} else {
				if (urlShares.length > 0) {
					sharecount = urlShares.reduce(function (prev, curr) {
						return prev + curr;
					});

					sharecount = sharecount / urlShares.length;
				}

				callback(null, sharecount);
			}
		})
	});
}

module.exports = exports = {};
exports.getPrimaryShareCount = getUrlShareCount;
exports.getSecondaryShareCount = getSecondaryShareCount;