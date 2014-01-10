var request = require('superagent'),
	BasicCache = require('../caches/BasicCache'),
	url = require('url');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	var cache = new BasicCache('sessions', application.store);
	return {
		check: function(session, callback) {
			cache.fetch(session, function(err, value) {
				if(!err && value) return callback(null, !!value);

				request.head(url.resolve(application.server, 'api/' + application.appid + '/' + session)).end(function(err, res) {
					if(err) return callback(err), false;
					return callback(null, true);
				});
			});
		},
		details: function(session, callback) {
			cache.fetch(session, function(err, value) {
				if(!err && value) return callback(null, value);

				request.get(url.resolve(application.server, 'api/' + application.appid + '/' + session)).sign(application).end(function(err, res) {
					if(err) return callback(err);
					if(!res.signed) return callback(new Error('Server response was not signed'));

					cache.store(session, res.header['X-Expires'], res.body, function(err) {
						return callback(null, res.body);
					});
				});
			});
		},
		close: function(session, callback) {
			request.delete(url.resolve(application.server, 'api/' + application.appid + '/' + session))
				.sign(application).end(function(err, res) {
				if(err) return callback(err);
				if(!res.signed) return callback(new Error('Server response was not signed'));

				cache.clear(session, function(err) {
					return callback(null, res.body);
				});
			});
		}
	}
};