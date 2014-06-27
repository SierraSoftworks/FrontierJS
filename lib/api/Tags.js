var request = require('superagent'),
	BasicCache = require('../caches/BasicCache'),
	url = require('url'),
	debug = require('debug')('frontier:api:tags');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	var cache = new BasicCache('tags', application.store);

	return {
		get: function(query, callback) {
			var req = request.get(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/tags'))
			if(/[!+-,]/.test(query))
				req.sign(application);
			req.cache(cache, /[!+-,]/.test(query) ? null : query, true)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode === 404) return callback(null, /[!+-]/.test(query) ? {} : null);
					if(res.statusCode !== 200) return callback(res.body, res);
					return callback(null, res.body);
				});
		},
		assign: function(query, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];
			request.post(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/tags'))
				.sign(application)
				.cache(cache, /[!+-,]/.test(query) ? null : query, true)
				.send(tags)
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
		add: function(query, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];
			request.put(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/tags'))
				.sign(application)
				.cache(cache, /[!+-,]/.test(query) ? null : query, true)
				.send(tags)
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
		remove: function(query, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];			
			request.del(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/tags'))
				.sign(application)
				.cache(cache, /[!+-,]/.test(query) ? null : query, true)
				.send(tags)
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