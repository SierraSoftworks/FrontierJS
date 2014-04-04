var request = require('superagent'),
	BasicCache = require('../caches/BasicCache'),
	url = require('url');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	var cache = new BasicCache('sessions', application.store);
	return {
		check: function(session, callback) {
			cache.get(session, function(err, value) {
				if(!err && value) return callback(null, true);

				request.head(url.resolve(application.server, 'api/' + application.appid + '/' + session)).end(function(err, res) {
					if(err) return callback(err, false);
					var valid = res.statusCode == 200;
					return callback(null, valid);
				});
			});
		},
		details: function(session, callback) {			
			request.get(url.resolve(application.server, 'api/' + application.appid + '/' + session))
				.sign(application)
				.cache(cache, session)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode === 404) return callback(null, null);
					if(res.statusCode !== 200) return callback(res.body, res);
					return callback(null, res.body);
				});
		},
		close: function(session, callback) {
			request.del(url.resolve(application.server, 'api/' + application.appid + '/' + session))
				.sign(application)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode !== 200) return callback(res.body, res);

					cache.clear(session, function(err) {
						return callback(null, res.body);
					});
				});
		}
	}
};