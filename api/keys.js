var APIClient = require('../http'),
	Cache = require('../cache'),
	utils = require('../utils');

var _ = require('lodash'),
	fn = require('functionality');

module.exports = function(frontier) {
	frontier.keys = {
		get: fn.first(utils.fn.promises.first).on(fn.opt(Function), function(callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'GET', '/api/:publickey/keys'));
		}).then(utils.fn.promises.then).compile(),
		
		create: fn.first(utils.fn.promises.first).on({
			name: String,
			publickey: String,
			permissions: Object
		}, fn.opt(Function), function(token, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'POST', '/api/:publickey/keys', token));
		}).then(utils.fn.promises.then).compile()
	};

	frontier.key = {
		get: fn.first(utils.fn.promises.first).on(fn.opt(Function), function(callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'GET', '/api/:publickey/key', null));
		}).on(String, fn.opt(Function), function(token, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'GET', '/api/:publickey/key/:token', null, { token: token }));
		}).then(utils.fn.promises.then).compile(),
		
		modify: fn.first(utils.fn.promises.first).on({ name: fn.opt(String), permissions: fn.opt(String) }, fn.opt(Function), function(changes, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'PUT', '/api/:publickey/key', changes));
		}).on(String, { name: fn.opt(String), permissions: fn.opt(String) }, fn.opt(Function), function(token, changes, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'PUT', '/api/:publickey/key/:token', changes, { token: token }));
		}).then(utils.fn.promises.then).compile(),
		
		reset: fn.first(utils.fn.promises.first).on(fn.opt(Function), function(callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'GET', '/api/:publickey/key/reset', null));
		}).on(String, fn.opt(Function), function(token, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'GET', '/api/:publickey/key/:token/reset', null, { token: token }));
		}).then(utils.fn.promises.then).compile(),
		
		remove: fn.first(utils.fn.promises.first).on(String, fn.opt(Function), function(token, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'DELETE', '/api/:publickey/key/:token', null, { token: token }));
		}).then(utils.fn.promises.then).compile()
	};
};