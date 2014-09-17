var APIClient = require('../http'),
	Cache = require('../cache'),
	utils = require('../utils');

var _ = require('lodash'),
	fn = require('functionality');

module.exports = function(frontier) {
	frontier.applications = {
		get: fn.first(utils.fn.promises.first).on(fn.opt(Function), function(callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request('GET', '/api/applications').then(frontier.client.toBody));
		}).then(utils.fn.promises.then).compile(),

		create: fn.first(utils.fn.promises.first).on({
			id: String,
			name: String,
			website: String,
			callback: String,
			logo: String
		}, fn.opt(Function), function(application, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request('POST', '/api/applications', application).then(frontier.client.toBody));
		}).then(utils.fn.promises.then).compile()
	};

	frontier.application = {
		details: fn.first(utils.fn.promises.first).on(fn.opt(Function), function(callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request('GET', '/api/:app_id').then(frontier.client.toBody));
		}).on(String, fn.opt(Function), function(application, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request('GET', '/api/:app', null, { app: application }).then(frontier.client.toBody));
		}).then(utils.fn.promises.then).compile(),
		
		modify: fn.first(utils.fn.promises.first).on({
			name: fn.opt(String),
			website: fn.opt(String),
			logo: fn.opt(String),
			callback: fn.opt(String)
		}, fn.opt(Function), function(changes, callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'PUT', '/api/:publickey', changes).then(frontier.client.toBody));
		}).then(utils.fn.promises.then).compile(),
		
		remove: fn.first(utils.fn.promises.first).on(fn.opt(Function), function(callback) {
			this.addCallback(callback);

			this.pipePromise(frontier.client.request(true, 'DELETE', '/api/:publickey').then(frontier.client.toBody));
		}).then(utils.fn.promises.then).compile()
	};
};