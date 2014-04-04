var request = require('superagent'),
	async = require('async'),
	_ = require('lodash'),
	BasicCache = require('../caches/BasicCache'),
	url = require('url');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	var cache = new BasicCache('details', application.store);
	return {
		get: function(query, callback) {
			request.get(url.resolve(application.server, 'api/' + application.appid + '/' + query + '/details'))
				.sign(application)
				.cache(cache, /[!+-]/.test(query) ? null : query)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode !== 200) return callback(res.body, res);
					return callback(null, res.body);
				});
		}
	}
};