var APIClient = require('../http'),
	Cache = require('../cache'),
	utils = require('../utils');

var _ = require('lodash'),
	fn = require('functionality');

module.exports = function(frontier) {
	frontier.session = {
		valid: fn.first(utils.fn.promises.first).on(String, fn.opt(Function), function(session, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'HEAD', '/api/:publickey/:session', null, { session: session }));
		}).then(utils.fn.promises.then).compile(),

		user: fn.first(utils.fn.promises.first).on(String, fn.opt(Function), function(session, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'GET', '/api/:publickey/:session', null, { session: session }));
		}).then(utils.fn.promises.then).compile(),

		close: fn.first(utils.fn.promises.first).on(String, fn.opt(Function), function(session, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'DELETE', '/api/:publickey/:session', null, { session: session }));
		}).then(utils.fn.promises.then).compile()
	};

	frontier.sessions = {
		get: fn.first(utils.fn.promises.first).on(String, fn.opt(Function), function(user, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'GET', '/api/:publickey/:user/sessions', null, { user: user }));
		}).then(utils.fn.promises.then).compile(),

		close: fn.first(utils.fn.promises.first).on(String, fn.opt(Function), function(user, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'DELETE', '/api/:publickey/:user/sessions', null, { user: user }));
		}).then(utils.fn.promises.then).compile()
	};
};