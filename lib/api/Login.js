var request = require('superagent'),
	url = require('url');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	return function(username, password, device, callback) {
		request.post(url.resolve(application.server, 'api/' + application.appid + '/login'))
				.sign(application)
				.send({
					username: username,
					password: password,
					device: device
				}).end(function(err, res) {
					if(err) return callback(err, res.body);
					if(res.statusCode !== 200) return callback(res.body, res);
					if(!res.signed) return new callback(new Error('Server response was not signed'), res.body);
					return callback(null, res.body);
				});
	};	
};