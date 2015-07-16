// Product can be invoked by the app (in app dir) or by the workers (in top level dir)
// Fix it so it can find the config file either way.
var currentDir = process.cwd()
if ( currentDir.indexOf('app') !== -1 ) {
	currentDir = currentDir+'/..'
}

var mongoose = require('mongoose'),
		config = require('boring-config')(currentDir+'/config.cson'),
		Schema = mongoose.Schema;

var ProductSchema = new Schema({
	url: {type: String, unique: true},
	site: {type: String, index: true},
	title: {type: String, default: ''},
	description: {type: String, default: ''},
	image: {type: String, default: ''},
	published: {type: Date, default: Date.now, index: true},
	lastUpdated: {type: Date, default: Date.now},
	comments: {type: Number, default: 0},
	likes: {type: Number, default: 0},
	score: {type: Number, default: 0},
	useful: {type: Boolean, default: false},
	deleted: {type: Boolean, default: false},
	deleteReason: {type: String, default: ''},
	type: {type: String, default: 'technology'},
	tags: [String],
	// History of amount of tweets linking to the product page
	primaryShareData: {type: [{date: Date, count: Number}], default: []},
	// History of amount of tweets mentioning a name and linking elsewhere
	secondaryShareData: {type: [{date: Date, count: Number}], default: []}
});

var DAY = 24 * 60 * 60 * 1000;

var daysAgo = function(daysAgo){
	return new Date() - ( daysAgo * DAY );
}

ProductSchema.statics.upsert = function (productDetails, callback) {

	var that = this;
	// if item is already in DB, do nothing
	this.findOne({url: productDetails.url}, function (err, result) {
		if (err) {
			callback(err);
		} else {
			if (result) {
				Object.keys(productDetails).forEach(function (key) {
					result[key] = productDetails[key];
				});
				result.save(callback);
			} else {
				var newProduct = new that(productDetails);
				newProduct.save(callback);
			}
		}
	});
}

ProductSchema.statics.getRecent = function (callback) {
	var now = new Date();
	var cutoff = daysAgo(30);
	return this
					.find({deleted: {$ne: true}})
					.where('published').gt(cutoff).lte(now)
					.sort('-score')
					.exec(callback);
}

ProductSchema.statics.getTopRated = function (timePeriod, type, callback) {
	log('Getting top rated products of type', type, 'since', timePeriod, 'days')

	var products = this
		.find({deleted: {$ne: true}, type: type})
		.exec(function (err, products) {
		if (err) {
			callback(err);
		} else {
			var primary = [], secondary = [], sortedAndTrimmed = [];
			var primaryScore = 0, secondaryScore = 0, score = 0;

			console.log(products.length + ' ' + type + ' products in total');

			products.forEach(function (product) {
				var primaryDeltas = [], secondaryDeltas = [];

				product.primaryShareData = filterSharesByDays(product.primaryShareData, timePeriod);
				product.secondaryShareData = filterSharesByDays(product.secondaryShareData, timePeriod);

				// calculate deltas
				product.primaryShareData
					.map(function (elm) {
						return elm.count;
					})
					.reduce(function (prev, curr) {
						var delta = curr - prev;
						primaryDeltas.push(delta);
						return curr;
					});

				product.secondaryShareData
					.map(function (elm) {
						return elm.count;
					})
					.reduce(function (prev, curr) {
						var delta = curr - prev;
						secondaryDeltas.push(delta);
						return curr;
					});

				// sum deltas, considering only positive values
				primaryScore = primaryDeltas.reduce(function (prev, curr) {
					if (prev < 0) prev = 0;
					if (curr < 0) curr = 0;

					return prev + curr;
				});

				secondaryScore = secondaryDeltas.reduce(function (prev, curr) {
					if (prev < 0) prev = 0;
					if (curr < 0) curr = 0;

					return prev + curr;
				});

				product.score = primaryScore + secondaryScore;
			});

			// desc order by score
			sortedAndTrimmed = products.sort(function (a, b) {
				if (a.score === b.score) {
					return 0;
				} else {
					return a.score < b.score ? 1 : -1;
				}
			}).filter(function (item) {
				return item.score > 0;
			});

			topRated = sortedAndTrimmed.slice(0, config.resultLimit)
			log('returning top ' + topRated.length + ' ' + type + ' products');

			callback(null, topRated);
		}
	});
}

// extract share data for days within specified range e.g. the last 3 days
function filterSharesByDays(dailyShareData, noOfDays) {
	var nowTimestamp = new Date().getTime();
	var dayMultiple,
			dayTimestamp,
			matchingDayScore = [],
			filteredScoreData = [];

	for (var i = noOfDays; i >= 0; i--) {
		dayMultiple = DAY * i;
		dayTimestamp = nowTimestamp - dayMultiple - (nowTimestamp % DAY);

		matchingDayScore = dailyShareData.filter(function (elm, idx) {
			var elmTimestamp = new Date(elm.date).getTime();

			if (elmTimestamp == dayTimestamp || elmTimestamp - DAY == elmTimestamp) {
				return true;
			}

			return false;
		});

		if (matchingDayScore[0]) {
			filteredScoreData.push(matchingDayScore[0]);
		} else {
			filteredScoreData.push({date: dayTimestamp, count: 0});
		}
	}

	return filteredScoreData;
}

var Product = mongoose.model('ProductSchema', ProductSchema);
module.exports = Product;