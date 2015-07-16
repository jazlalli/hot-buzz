module.exports = exports = {};
exports.cleanProductName = cleanProductName;

// list of colours to look out for in product names, feel free to add new ones
var colorRegex = /\b(white|black|red|blue|green|yellow|pink|purple|brown|tan|cream|orange|mustard|ivory|grey|silver|gold|beige)\b/g;

var cleanProductTitle = function cleanProductTitle(product) {
	var nameparts = [],
			partsToStrip = [],
			partsToReturn = [product];

	// nothing to do
	if (product.indexOf('-') === -1 && product.indexOf('(') === -1)
		return product;

	// get rid of stuff in parentheses
	if (product.indexOf('(') > -1) {
		return product.split('(')[0].trim();
	}

	// strip color info after a hyphen
	if (product.indexOf('-') > -1) {
		nameparts = product.split('-');

		var partsToStrip = nameparts.filter(function (part) {
			return colorRegex.test(part.trim().toLowerCase());
		});

		if (partsToStrip.length > 0) {
			partsToStrip = partsToStrip.reduce(function (prev, curr) {
				return prev.trim();
			});

			partsToReturn = nameparts.splice(0, nameparts.indexOf(partsToStrip));
		}

		return partsToReturn.join('-').trim();
	}
}

function cleanProductName(productName) {
	return cleanProductTitle(productName);
}