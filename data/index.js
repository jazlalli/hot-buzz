// Data can be invoked by the app (in app dir) or by the workers (in top level dir)
// Fix it so it can find the config file either way.
var currentDir = process.cwd()
if ( currentDir.indexOf('app') !== -1 ) {
  currentDir = currentDir+'/..';
}

var mongoose = require('mongoose'),
		utils = require('../lib/utils.js'),
		mongoUrl = 'mongodb://127.0.0.1:27017/OnlineWednesday';

var config = require('boring-config')(currentDir+'/config.cson')

mongoose.connect('mongodb://'+config.mongodb.host+':'+config.mongodb.port+'/'+config.mongodb.name);

var db = mongoose.connection;

db.on('error', function (err) {
  if (err) {
    log('Could not connect to MongoDB database', config.mongodb.name, 'on', config.mongodb.host, config.mongodb.port)
    log("You might have forgotten to run 'mongod'.")
    process.exit(1);
  }
});

db.once('open', function () {
	log('CONNECTED TO', mongoUrl);
});

module.exports = db;