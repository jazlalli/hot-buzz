module.exports = exports = {};
exports.getShareCount = getShareCount;
exports.getSecondaryShareCount = getSecondaryShareCount;

var request = require('../../../patches/requestPatch'),
		async = require('async'),
		twitter = require('./twitter');

var USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36';

function getShareCount(url, callback) {
	var options = {
		url: 'http://graph.facebook.com/?id=' + escape(url),
		headers: { 'User-Agent': USER_AGENT },
		encoding: 'utf8',
		timeout: 5000
	};

	request(options, function (err, res, body) {
		var data = {};
		console.log('facebook shares'.green, url);

		if (err || body.error) {
			callback(null, 0);
		} else {
			data = JSON.parse(body);
			callback(null, data.shares || 0);
		}
	});
};

// main
function getSecondaryShareCount(productName, callback) {
	twitter.getLinksFromTweets(productName, function (err, links) {
		var urlShares = [];

		var getShareData = function getShareData(url, cb) {
			if (!url) cb();
			else {
				getShareCount(url, function (err, shares) {
					urlShares.push(shares);
					cb();
				});
			}
		}

		// get full URL and then sharing stats for each tweeted link
		async.eachLimit(links, 10, getShareData, function (err) {
			if (err) {
				console.log('GET BUZZ ERROR', err);
				callback(err);
			} else {
				callback(null, urlShares);
			}
		});
	});
}