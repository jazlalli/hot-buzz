var FeedConsumer = function FeedConsumer() {};

FeedConsumer.prototype.use = function (strategy) {
	this.strategy = strategy;
}

FeedConsumer.prototype.consume = function(feed, callback) {

	if (typeof this.strategy === 'undefined' || this.strategy === null) {
		throw new Error('Strategy not defined. Call FeedConsumer#use to set strategy.')
	}

	this.strategy.execute(feed, callback);
};

module.exports = new FeedConsumer();