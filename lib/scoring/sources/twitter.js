module.exports = exports = {};
exports.getShareCount = getShareCount;
exports.getLinksFromTweets = getLinksFromTweets;

var request = require('../../../patches/requestPatch'),
		async = require('async'),
		utils = require('../../../lib/utils'),
		Twitter = require('twit'),
		dataUtils = require('../../../data/utils/'),
		colors = require('colors'),
		rateLimit = require('function-rate-limit');

var config = require('boring-config')('config.cson')

// https://dev.twitter.com/rest/public/rate-limiting
// 'Search will be rate limited at 180 queries per 15 minute window for the time being'
var TWITTER_RATE_LIMIT = {
	CALLS: 180,
	TIME: 15 * 60 * 1000
}

var getTweetsRateLimited = rateLimit(TWITTER_RATE_LIMIT.CALLS, TWITTER_RATE_LIMIT.TIME, function(searchTerm, since, callback){
	twitter.get('search/tweets', {q: escape(searchTerm) + ' since:' + since, count: 100}, function (err, data, res) {
		callback(err, data.statuses || null);
	});
})


var twitter = new Twitter({
	consumer_key: config.twitter.consumerKey,
	consumer_secret: config.twitter.consumerSecret,
	access_token: config.twitter.accessToken,
	access_token_secret: config.twitter.accessTokenSecret
});

var validLinkKeywords = [
	'(product)',
	'(products)',
	'(review)',
	'(reviews)',
	'(reviewed)',
	'(launch)',
	'(launched)',
	'(release)',
	'(releases)',
	'(released)',
	'(announce)',
	'(announced)',
	'(announcement)',
	'(update)',
	'(updated)',
	'(new)'
];

var VALID_LINK_REGEX = new RegExp(validLinkKeywords.join('|'), 'gi');

// return top 100 tweets matching search term
var getTweets = function getTweets(searchTerm, callback) {
	var now = new Date(),
			since = '';

	now.setDate(now.getDate() - 1);
	since = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-');
	searchTerm = dataUtils.cleanProductName(searchTerm);
	getTweetsRateLimited(searchTerm, since, callback);
}

// extract t.co links from array of tweets provided
var harvestLinks = function harvestLinks(tweets) {
	var urlRegEx = /https?:\/\/[a-z]+.[a-zA-Z]+\/[a-zA-Z0-9]+/g,
			urlsFromTweets = [],
			distinctUrls = [];

	urlsFromTweets = tweets.map(function (elm, idx, self) {
		return elm.text.match(urlRegEx);
	});

	if (urlsFromTweets.length > 0) {
		urlsFromTweets = urlsFromTweets.reduce(function (prev, curr) {
			if (prev) return prev.concat(curr);
			else if (curr) return curr.concat();
			else return;
		});

		if (urlsFromTweets) {

			urlsFromTweets = urlsFromTweets.map(function (url) {
				if (distinctUrls.indexOf(url) < 0) {
					distinctUrls.push(url);
				}
			});
		}
	}

	return distinctUrls;
}

// helper to ensure full URL is obtained from a shortened one
var getFullUrl = function getFullUrl(url, callback) {
	var options = {
		url: url,
		method: 'HEAD',
		followAllRedirects: true,
		maxRedirects: 10
	};

	request(options, function (err, res, body) {
		if (err) {
			// https://github.com/joyent/node/issues/4863
			if ( err.code === 'HPE_INVALID_CONSTANT' ) {
				err = 'HTTP parse error - site is sending back invalid HTML'
			}
			log('#request() callback error', err, url);
			callback();
		} else {
			callback(res.request.href);
		}
	});
}

function getLinksFromTweets(searchTerm, callback) {

	getTweets(searchTerm.trim(), function (err, tweets) {
		if (err) {
			callback(err);
		} else {
			var fullUrls = [];
			var links = harvestLinks(tweets).filter(function (el) {
				return Boolean(el);
			});

			var getLink = function getLink(url, cb) {
				getFullUrl(url, function (url) {
					if (url && url.search(VALID_LINK_REGEX) !== -1) {
						if (fullUrls.indexOf(url) < 0) {
							console.log('===>>> secondary url:'.yellow, url.yellow);

							// TODO: write the url out to a file for manual verification

							fullUrls.push(url);
						}
					}

					cb();
				});
			};

			// get full URL and then sharing stats for each tweeted link
			async.eachLimit(links, 3, getLink, function (err) {
				if (err) {
					log('async #getLink() error', err);
					callback(err);
				} else {
					callback(null, fullUrls);
				}
			});
		}
	});
}

// wrapper to get share count of a given URL
function getShareCount(url, callback) {
	var options = {
		url: 'http://urls.api.twitter.com/1/urls/count.json?url=' + escape(url),
		headers: { 'User-Agent': config.twitter.userAgent },
		encoding: 'utf8',
		timeout: 5000
	};

	request(options, function (err, res, body) {
		var parsedBody = {};
		if ( body ) {
			parsedBody = JSON.parse(body)
		} else {
			err = 'No body in response'
		}
		log('twitter shares'.blue, url);
		if ( err ) {
			log('Error getting Twitter share count', err)
			// TODO: callback with null even though we have an error?
			// If we always call callback with null, change signature.
			callback(null, 0);
		} else {
			callback(null, parsedBody.count || 0);
		}
	});
}