var APIClient = require('../http'),
	Cache = require('../cache'),
	utils = require('../utils');

var _ = require('lodash'),
	fn = require('functionality');

module.exports = function(frontier) {
	frontier.time = fn.first(utils.fn.promises.first).on(fn.opt(Function), function(callback) {
		this.addCallback(callback);

		this.pipePromise(frontier.client.request('GET', '/api/server/time').then(frontier.client.toBody));
	}).then(utils.fn.promises.then).compile();
};