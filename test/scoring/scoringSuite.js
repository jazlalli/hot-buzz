var assert = require('assert');
var scoring = require('../../scoring');

/*
exports.getPrimaryShareCount = getUrlShareCount;
exports.getSecondaryShareCount = getSecondaryShareCount;
exports.calcAvgSharesPerLink = calcAvgSharesPerLink;
*/

describe('product ranking', function () {
	describe('#calcAvgSharesPerLink()', function () {

		it('should return the average of values in array provided', function () {
			var testCase = [5,2,7,8,3,6,12,2];
			var expected = 5.625;

			assert.equal(scoring.calcAvgSharesPerLink(testCase), expected);
		});

		it('should return 0 if no share data is provided', function () {
			var testCase = [];
			var expected = 0;

			assert.equal(scoring.calcAvgSharesPerLink(testCase), expected);
		});

	});
});