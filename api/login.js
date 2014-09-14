var APIClient = require('../http'),
	Cache = require('../cache'),
	utils = require('../utils');

var _ = require('lodash'),
	fn = require('functionality');

module.exports = function(frontier) {
	frontier.login = fn.first(utils.fn.promises.first).on({ username: String, password: String }, fn.opt(Function), function(user, callback) {
		this.addCallback(callback);

		this.pipePromise(frontier.client.request(true, 'POST', '/api/:publickey/login', user));
	}).then(utils.fn.promises.then).compile();
};