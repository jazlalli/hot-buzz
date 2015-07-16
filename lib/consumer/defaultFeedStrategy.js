var Strategy = function Strategy() {};

Strategy.prototype.execute = function () {
	throw new Error('Strategy#execute is not implemented.');
}

module.exports = Strategy;