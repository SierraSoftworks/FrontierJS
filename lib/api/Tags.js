var request = require('superagent'),
	BasicCache = require('../caches/BasicCache'),
	url = require('url');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	var cache = new BasicCache('tags', application.store);

	return {
		get: function(username, callback) {
			cache.get(username, function(err, value) {
				if(!err && value) return callback(null, value);

				request.get(url.resolve(application.server, 'api/' + application.appid + '/' + username, 'tags')).sign(application).end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode !== 200) return callback(res.body, res);
					if(!res.signed) return callback(new Error('Server response was not signed'));

					cache.set(username, res.header['x-expires'], res.body, function(err) {
						return callback(null, res.body);
					});
				});
			});
		},
		assign: function(username, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];
			request.post(url.resolve(application.server, 'api/' + application.appid + '/' + username, 'tags'))
				.sign(application).send(tags).end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode !== 200) return callback(res.body, res);
					if(!res.signed) return callback(new Error('Server response was not signed'));

					cache.set(username, res.header['x-expires'], res.body, function(err) {
						return callback(null, res.body);
					});
				});
		},
		add: function(username, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];
			request.put(url.resolve(application.server, 'api/' + application.appid + '/' + username, 'tags'))
				.sign(application).send(tags).end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode !== 200) return callback(res.body, res);
					if(!res.signed) return callback(new Error('Server response was not signed'));

					cache.set(username, res.header['x-expires'], res.body, function(err) {
						return callback(null, res.body);
					});
				});
		},
		remove: function(username, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];
			request.del(url.resolve(application.server, 'api/' + application.appid + '/' + username, 'tags'))
				.sign(application).send(tags).end(function(err, res) {
					if(err) return callback(err);
					if(res.statusCode !== 200) return callback(res.body, res);
					if(!res.signed) return callback(new Error('Server response was not signed'));

					cache.set(username, res.header['x-expires'], res.body, function(err) {
						return callback(null, res.body);
					});
				});
		}
	}
};