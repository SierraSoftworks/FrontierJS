var request = require('superagent'),
	async = require('async'),
	_ = require('lodash'),
	BasicCache = require('../caches/BasicCache'),
	url = require('url');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	var cache = new BasicCache('permissions', application.store);
	return {
		get: function(query, callback) {
			var req = request.get(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/permissions'));
			if(/[!+-,]/.test(query))
				req.sign(application);
			req.cache(cache, /[!+-,]/.test(query) ? null : query)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode === 404) return callback(null, /[!+-]/.test(query) ? {} : null);
					if(res.statusCode !== 200) return callback(res.body, res);
					return callback(null, res.body);
				});
		},
		assign: function(query, permissions, callback) {
			request.post(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/permissions'))
				.sign(application)
				.cache(cache, /[!+-,]/.test(query) ? null : query, true)
				.send(permissions)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode === 404) return callback(null, /[!+-]/.test(query) ? {} : null);
					if(res.statusCode !== 200) return callback(res.body, res);
					

					if(/[!+-]/.test(query)) return callback(null, res.body);
					application.api.account.purge(query, function(err) {
						return callback(null, res.body);
					});
				});
		},
		grant: function(query, permissions, callback) {
			request.put(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/permissions'))
				.sign(application)
				.cache(cache, /[!+-,]/.test(query) ? null : query, true)
				.send(permissions)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode === 404) return callback(null, /[!+-]/.test(query) ? {} : null);
					if(res.statusCode !== 200) return callback(res.body, res);

					if(/[!+-]/.test(query)) return callback(null, res.body);
					application.api.account.purge(query, function(err) {
						return callback(null, res.body);
					});				
				});
		},
		revoke: function(query, permissions, callback) {
			request.del(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/permissions'))
				.sign(application)
				.cache(cache, /[!+-,]/.test(query) ? null : query, true)
				.send(permissions)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode === 404) return callback(null, /[!+-]/.test(query) ? {} : null);
					if(res.statusCode !== 200) return callback(res.body, res);
					

					if(/[!+-]/.test(query)) return callback(null, res.body);
					application.api.account.purge(query, function(err) {
						return callback(null, res.body);
					});
				});
		},
		purge: function(username, callback) {
			cache.clear(username, callback);
		}
	}
};