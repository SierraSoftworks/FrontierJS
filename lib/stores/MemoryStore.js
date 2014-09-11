var _ = require('lodash');
module.exports = MemoryStore;

function MemoryStore() {
	this.__cache = {};
}

MemoryStore.prototype.set = function(key, expiry, value, callback) {
	this.__cache[key] = {
		expiresAt: expiry,
		value: value
	};
	callback(null);
};

MemoryStore.prototype.setMulti = function(keys, values, expiry, callback) {
	for(var i = 0; i < keys.length; i++)
		this.__cache[keys[i]] = {
			expiresAt: expiry,
			value: values[i]
		};
	callback(null);
};

MemoryStore.prototype.get = function(key, callback) {
	if(!this.__cache[key]) return callback(null, null);
	if(this.__cache[key].expiresAt.getTime() < (new Date()).getTime()) {
		delete this.__cache[key];
		return callback(null, null);
	}

	return callback(null, this.__cache[key].value);
};

MemoryStore.prototype.getMulti = function(keys, callback) {
	var values = _.map(keys, (function(key) {
		if(this.__cache[key].expiresAt.getTime() < (new Date()).getTime()) delete this.__cache[key];
		return this.__cache[key] && this.__cache[key].value;
	}).bind(this));

	return callback(null, values);
};

MemoryStore.prototype.remove = function(key, callback) {
	if(this.__cache[key]) delete this.__cache[key];
	return callback(null);
};