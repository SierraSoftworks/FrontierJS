var request = require('superagent'),
	BasicCache = require('../caches/BasicCache'),
	url = require('url'),
	debug = require('debug')('frontier:api:tags');
require('../extensions/superagent-frontier')(request);

module.exports = function(application) {
	var cache = new BasicCache('tags', application.store);

	return {
		get: function(username, callback) {
			cache.get(username, function(err, value) {
				if(!err && value) {
					debug('get %s retrieved from cache', username);
					return callback(null, value);
				}

				request.get(url.resolve(application.server, 'api/' + application.appid + '/' + username + '/tags')).end(function(err, res) {
					if(err) {
						debug('get %s failed with error %s', username, err.message);
						return callback(err);
					}

					if(res.statusCode !== 200) {
						debug('get %s failed with status %s', username, res.statusCode);
						return callback(res.body, res);
					}

					cache.set(username, res.header['x-expires'], res.body, function(err) {
						debug('get %s succeeded', username);
						return callback(null, res.body);
					});
				});
			});
		},
		assign: function(username, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];
			request.post(url.resolve(application.server, 'api/' + application.appid + '/' + username + '/tags'))
				.sign(application).send(tags).end(function(err, res) {
					if(err) {
						debug('assign %s failed with error %s', username, err.message);
						return callback(err);
					}

					if(res.statusCode !== 200) {
						debug('assign %s failed with status %s', username, res.statusCode);
						return callback(res.body, res);
					}
					if(!res.signed) return callback(new Error('Server response was not signed'));

					cache.set(username, res.header['x-expires'], res.body, function(err) {
						return callback(null, res.body);
					});
				});
		},
		add: function(username, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];
			request.put(url.resolve(application.server, 'api/' + application.appid + '/' + username + '/tags'))
				.sign(application).send(tags).end(function(err, res) {
					if(err) {
						debug('add %s failed with error %s', username, err.message);
						return callback(err);
					}

					if(res.statusCode !== 200) {
						debug('add %s failed with status %s', username, res.statusCode);
						return callback(res.body, res);
					}
					if(!res.signed) return callback(new Error('Server response was not signed'));

					cache.set(username, res.header['x-expires'], res.body, function(err) {
						return callback(null, res.body);
					});
				});
		},
		remove: function(username, tags, callback) {
			if(!Array.isArray(tags)) tags = [tags];
			request.del(url.resolve(application.server, 'api/' + application.appid + '/' + username + '/tags'))
				.sign(application).send(tags).end(function(err, res) {
					if(err) {
						debug('remove %s failed with error %s', username, err.message);
						return callback(err);
					}

					if(res.statusCode !== 200) {
						debug('remove %s failed with status %s', username, res.statusCode);
						return callback(res.body, res);
					}
					if(!res.signed) return callback(new Error('Server response was not signed'));

					cache.set(username, res.header['x-expires'], res.body, function(err) {
						return callback(null, res.body);
					});
				});
		}
	}
};