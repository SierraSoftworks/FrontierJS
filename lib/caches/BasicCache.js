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
	var key = this.prefix + ':' + username;
	this.store.get(key, callback);
};

BasicCache.prototype.clear = function(username, callback) {
	if(/^[!+-]/.test(username)) return callback(null, null);
	var key = this.prefix + ':' + username;
	this.store.remove(key, callback);
}