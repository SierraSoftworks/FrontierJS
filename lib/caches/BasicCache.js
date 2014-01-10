module.exports = BasicCache;

function BasicCache(prefix, store) {
	this.prefix = prefix;
	this.store = store;
}

BasicCache.prototype.set = function(username, expires, value, callback) {
	if(/^[!+-]/.test(username))
		return this.storeMap(value, expires, callback);
	var key = this.prefix + ':' + username;
	this.store.set(key, expires, value, callback);
};

BasicCache.prototype.setMap = function(map, expires, callback) {
	var keys = Object.keys(map);
	var next = (function(err) {
		if(err) return callback(err);
		if(keys.length === 0) return callback(null);
		var currentKey = keys.shift();
		this.store(currentKey, expires, map[currentKey], next);
	}).bind(this);

	next();
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