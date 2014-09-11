var async = require('async'),
	_ = require('lodash');

module.exports = BasicCache;

function BasicCache(prefix, store) {
	this.prefix = prefix;
	this.store = store;
}

BasicCache.prototype.set = function(username, expires, value, callback) {
	if(/^[!+-]/.test(username))
		return this.setMulti(value, function(c) { return c.id; }, expires, callback);

	var key = this.prefix + ':' + username;
	expires = new Date((new Date()).getTime() + parseInt(expires));
	this.store.set(key, expires, value, callback);
};

BasicCache.prototype.setMulti = function(array, toKey, expires, callback) {
	expires = new Date((new Date()).getTime() + parseInt(expires));
	this.store.setMulti(_.map(_.map(array, toKey), (function(k) { return this.prefix + ':' + k; }).bind(this)), array, expires, callback);
};

BasicCache.prototype.get = function(username, callback) {
	if(/^[!+-]/.test(username)) return callback(null, null);
	if(/,/.test(username)) return this.getMulti(username.split(','), callback);
	var key = this.prefix + ':' + username;
	this.store.get(key, callback);
};

BasicCache.prototype.getMulti = function(keys, callback) {
	this.store.getMulti(_.map(keys, (function(k) { return this.prefix + ':' + k; }).bind(this)), callback);
};

BasicCache.prototype.clear = function(username, callback) {
	if(/^[!+-]/.test(username)) return callback(null, null);
	if(/,/.test(username)) return this.clearSet(username.split(','), callback);
	var key = this.prefix + ':' + username;
	this.store.remove(key, callback);
};