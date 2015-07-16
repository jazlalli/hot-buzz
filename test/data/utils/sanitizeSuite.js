var assert = require('assert');
var sanitizer = require('../../../data/utils/sanitize');

describe('data sanitizer', function () {
	describe('#cleanProductName()', function () {

		it('should return the value passed in if there\'s nothing to do', function () {
			var testCase = 'Apple Wireless Keyboard';
			var expected = 'Apple Wireless Keyboard';

			assert.equal(sanitizer.cleanProductName(testCase), expected);
		});

		it('should strip everything contained in parentheses', function () {
			var testCase = 'Apple MacBook Air 11 Inch (i5, 1.3GHz, 4GB, 256GB, Mac OS X)';
			var expected = 'Apple MacBook Air 11 Inch';

			assert.equal(sanitizer.cleanProductName(testCase), expected);
		});

		it('should strip color information after the hyphen', function () {
			var testCase = 'Bang & Olufsen Beoplay A8 Dock with Airplay - Black';
			var expected = 'Bang & Olufsen Beoplay A8 Dock with Airplay';

			assert.equal(sanitizer.cleanProductName(testCase), expected);
		});

		it('should strip color information but keep other details', function () {
			var testCase = 'dbramante1928 Leather Laptop Case 13 Inch - 14 Inch - Beige Suede and Brown Piping';
			var expected = 'dbramante1928 Leather Laptop Case 13 Inch - 14 Inch';

			assert.equal(sanitizer.cleanProductName(testCase), expected);
		});

		it('should strip color and everything in parentheses', function () {
			var testCase = 'Fujifilm FinePix XP200 Tough Outdoor Digital Camera (16MP, 5x Optical Zoom) - Red';
			var expected = 'Fujifilm FinePix XP200 Tough Outdoor Digital Camera';

			assert.equal(sanitizer.cleanProductName(testCase), expected);
		})

		it('should return something and not an empty string', function () {
			var testCase = 'iPad Mini with Retina display Wi-Fi 128GB';
			var expected = 'iPad Mini with Retina display Wi-Fi 128GB';

			assert.equal(sanitizer.cleanProductName(testCase), expected);
		});

		it('should not strip things unnecessarily', function () {
			var testCase = 'Aorus X7';
			var expected = 'Aorus X7';

			assert.equal(sanitizer.cleanProductName(testCase), expected);
		});

	});

});