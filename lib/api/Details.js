var request = require('superagent'),
	BasicCache = require('../caches/BasicCache'),
	url = require('url');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	var cache = new BasicCache('details', application.store);
	return {
		get: function(username, callback) {
			cache.get(username, function(err, value) {
				if(!err && value) return callback(null, value);

				request.get(url.resolve(application.server, 'api/' + application.appid, username + '/details')).sign(application).end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode !== 200) return callback(res.body, res);
					if(!res.signed) return callback(new Error('Server response was not signed'));

					cache.set(username, res.header['x-expires'], res.body, function(err) {
						return callback(null, res.body);
					});
				});
			});
		}
	}
};