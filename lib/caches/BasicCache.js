var async = require('async'),
	_ = require('lodash');

module.exports = BasicCache;

function BasicCache(prefix, store) {
	this.prefix = prefix;
	this.store = store;
}

BasicCache.prototype.set = function(username, expires, value, callback) {
	if(/^[!+-]/.test(username))
		return this.setMap(value, expires, callback);

	var key = this.prefix + ':' + username;
	expires = new Date((new Date()).getTime() + parseInt(expires));
	this.store.set(key, expires, value, callback);
};

BasicCache.prototype.setMap = function(map, expires, callback) {
	async.parallel(_.map(map, function(value, key) {
		return (function(done) {
			this.set(key, expires, value, done);
		}).bind(this);
	}, this), function(err) {
		return callback(err);
	});
};

BasicCache.prototype.get = function(username, callback) {
	if(/^[!+-]/.test(username)) return callback(null, null);
	if(/,/.test(username)) return this.getSet(username.split(','), callback);
	var key = this.prefix + ':' + username;
	this.store.get(key, callback);
};

BasicCache.prototype.getSet = function(usernames, callback) {
	async.parallel(_.map(usernames, function(key) {
		return (function(done) {
			key = this.prefix + ':' + key;
			this.store.get(key, done);
		}).bind(this);
	}, this), function(err, results) {
		if(err) return callback(err);
		return callback(null, zip(usernames, results));
	});
};

BasicCache.prototype.clear = function(username, callback) {
	if(/^[!+-]/.test(username)) return callback(null, null);
	if(/,/.test(username)) return this.clearSet(username.split(','), callback);
	var key = this.prefix + ':' + username;
	this.store.remove(key, callback);
};

BasicCache.prototype.clearSet = function(usernames, callback) {
	async.parallel(_.map(usernames, function(key) {
		return (function(done) {
			key = this.prefix + ':' + key;
			this.store.remove(key, done);
		}).bind(this);
	}, this), callback);
};

function zip(keys, values) {
	var result = {};
	for(var i = 0; i < Math.min(keys.length, values.length); i++)
		result[keys[i]] = values[i];
	return result;
}