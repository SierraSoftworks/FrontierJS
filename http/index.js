var _ = require('lodash'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	crypto = require('crypto'),
	Q = require('q'),
	fn = require('functionality'),
	url = require('url'),
	debug = require('debug')('frontier:http');

var utils = require('../utils');

module.exports = APIClient;

function APIClient(frontier, client) {
	this.frontier = frontier;
	this.client = client;
	this.timeOffset = null;
}

util.inherits(APIClient, EventEmitter);

APIClient.prototype.prepare = function() {
	if(this.timeOffset !== null) return Q();
	return this.request('GET', '/api/server/time').then((function(time) {
		this.timeOffset = time;
		return Q();
	}).bind(this), function(err) {
		console.warn("Failed to retrieve remote server time offset, disable by setting frontier.client.timeOffset = false");
		return Q();
	});
};

APIClient.prototype.toBody = function(res) {
	return Q(res.body);
};

APIClient.prototype.request = fn.first(function() {
	this.deferred = Q.defer();
}).on(String, String, function(method, path) {
	this.frontier = this.context.frontier;
	this.method = method;
	this.path = replaceAll(path, this.frontier);

	this.data = null;
	this.secure = false;
}).on(Boolean, String, String, function(secure, method, path) {
	this.frontier = this.context.frontier;
	this.method = method;
	this.path = replaceAll(path, this.frontier);

	this.data = null;
	this.secure = secure;
}).on(String, String, fn.opt(Object), fn.opt(Object), function(method, path, data, placeholders) {
	this.frontier = this.context.frontier;

	this.method = method;
	this.path = replaceAll(replaceAll(path, placeholders), this.frontier);

	this.data = data && JSON.stringify(data);
	this.secure = false;
}).on(Boolean, String, String, fn.opt(Object), fn.opt(Object), function(secure, method, path, data, placeholders) {
	this.frontier = this.context.frontier;

	this.method = method;
	this.path = replaceAll(replaceAll(path, placeholders), this.frontier)

	this.data = data && JSON.stringify(data);
	this.secure = secure;
}).then(function() {
	var time = new Date().getTime() + (this.context.timeOffset || 0);
	var server = url.parse(this.context.frontier.server);
	var options = {
		hostname: server.hostname,
		port: server.port,
		path: this.path,
		method: this.method,
		headers: {
			'User-Agent': utils.useragent()
		}
	};

	var hash = this.secure && new utils.hash(crypto.createHash('sha512'))
		.update(this.context.frontier.privatekey.toLowerCase()).update(':')
		.update(time.toString()).update(':')
		.update(this.method.toUpperCase()).update(':')
		.update(this.path.toLowerCase()).update(':');

	if(this.data) {
		options.headers['Content-Type'] = 'application/json';
		this.secure && hash.update(this.data);
	}

	if(this.secure) {
		options.headers['X-Time'] = time;
		options.headers['X-Hash'] = hash.digest('hex');
	}

	debug(options);

	var req = this.context.client.request(options, (function(res) {
		var expectedHash = res.headers['x-hash'] || '';
		var expires = res.headers['x-expires'] || '';

		res.setEncoding('utf8');

		var data = "";
		var hash = this.secure && new utils.hash(crypto.createHash('sha512'))
			.update(this.context.frontier.privatekey.toLowerCase()).update(':')
			.update(options.headers['X-Hash']).update(':')
			.update(expires).update(':');

		res.on('data', (function(chunk) {
			this.secure && hash.update(chunk);
			data += chunk;
		}).bind(this));

		res.on('end', (function() {
			res.body = data ? JSON.parse(data) : {};

			if (res.statusCode != 200)
				return this.deferred.reject(res.body);
			if(this.secure && !expectedHash)
				return this.deferred.reject(new Error('The server did not sign the response message.'));
			if(this.secure && !expires)
				return this.deferred.reject(new Error('The server did not provide a valid expiry time for its response.'));

			var actualHash = this.secure && hash.digest('hex');
			if(this.secure && actualHash != expectedHash)
				return this.deferred.reject(new Error('The signing token returned by the server did not match the expected value.'));

			return this.deferred.resolve(res);
		}).bind(this));
	}).bind(this));

	req.on('error', (function(err) {
		this.deferred.reject(err);
	}).bind(this));

	if(this.data) req.write(this.data);
	req.end();

	return this.deferred.promise;
}).compile();

function replaceAll(str, tokens) {
	if(!tokens) return str;
	return str.replace(/:([\w_]+)/g, function(match, token) {
		return tokens[token] || match;
	});
};