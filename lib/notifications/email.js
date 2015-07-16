var os = require('os'),
		path = require('path'),
		nodemailer = require('nodemailer'),
		templatesDir = path.resolve(__dirname, 'templates'),
		emailTemplates = require('email-templates');

module.exports = function (alertsConfig, callback) {
	var api = {
		sendEmail: function (options, callback) {
			if (callback) {
				callback();
			}
		}
	};

	var transport = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: "labs@thesandpit.com",
			pass: "ShEuBHNYfE55"
		}
	});

	if (alertsConfig && alertsConfig.enabled) {
		emailTemplates(templatesDir, function (err, template) {

			api.sendEmail = function (options, callback) {
				options = options || {};

				if (!options.alertType) {
					throw new Error('no alertType specified for email alert');
				}

				if (!options.content) {
					throw new Error('email needs some content');
				}

				if (options.content.body) {
					options.content.lines = options.content.body.split('\n');
				}

				// Send a single email
				template(options.alertType, options.content, function (err, html, text) {
					if (err) {
						console.log(err);
					} else {
						console.log('=> generating', options.alertType, 'email alert');

						var mailOptions = {
							from: "Online Wednesday <notifcations@ow.com>",
							to: alertsConfig.emailAddresses,
							subject: options.content.subject,
							generateTextFromHTML: true,
							html: html,
							text: text
						};

						transport.sendMail(mailOptions, function (err, info) {
							if (err) {
								console.log(err);
							}	else {
								console.log('=> alert sent to:', info.accepted.join(' & '));
							}

							if (callback) {
								callback();
							}
						});
					}
				});
			}
		});
	}

	return api;
}