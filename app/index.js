#!/usr/bin/env node

var express = require('express'),
		expressHandlebars = require('express3-handlebars'),
		setupRoutes = require('./router'),
		boringConfig = require('boring-config'),
		utils = require('../lib/utils.js');

var app = express(),
		handlebars;

var config = boringConfig('../config.cson')

handlebars = expressHandlebars.create({
	layoutsDir: 'views/layouts',
	defaultLayout: 'default'
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', 'views');
app.use('/static', express.static('./static'));

setupRoutes(app, function () {
	log('routes created');
});

var port = process.env.PORT || config.port;
var server = app.listen(port, function () {
	log('app listening on port', port);
});