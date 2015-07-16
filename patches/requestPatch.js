var http = require('http');
var request = require('request');

http.globalAgent.maxSockets = 1000;

module.exports = function (options, callback) {
	request(options, callback);
};