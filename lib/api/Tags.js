var request = require('superagent'),
	BasicCache = require('../caches/BasicCache'),
	url = require('url'),
	debug = require('debug')('frontier:api:tags');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	var cache = new BasicCache('tags', application.store);

	return {
		get: function(query, callback) {
			request.get(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/tags'))
				.cache(cache, /[!+-]/.test(query) ? null : query)
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
				.send(tags)
				.cache(cache, /[!+-]/.test(query) ? null : query, true)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode === 404) return callback(null, /[!+-]/.test(query) ? {} : null);
					if(res.statusCode !== 200) return callback(res.body, res);
					return callback(null, res.body);
				});
		},
		add: function(query, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];
			request.put(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/tags'))
				.sign(application)
				.send(tags)
				.cache(cache, /[!+-]/.test(query) ? null : query, true)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode === 404) return callback(null, /[!+-]/.test(query) ? {} : null);
					if(res.statusCode !== 200) return callback(res.body, res);
					return callback(null, res.body);
				});
		},
		remove: function(query, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];			
			request.del(url.resolve(application.server, 'api/' + application.appid + '/' +query + '/tags'))
				.sign(application)
				.send(tags)
				.cache(cache, /[!+-]/.test(query) ? null : query, true)
				.end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode === 404) return callback(null, /[!+-]/.test(query) ? {} : null);
					if(res.statusCode !== 200) return callback(res.body, res);
					return callback(null, res.body);
				});
		}
	}
};