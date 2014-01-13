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

MemoryStore.prototype.get = function(key, callback) {
	if(!this.__cache[key]) return callback(null, null);
	if(this.__cache[key].expiresAt.getTime() > (new Date()).getTime()) {
		delete this.__cache[key];
		return callback(null, null);
	}

	return callback(null, this.__cache[key].value);
};

MemoryStore.prototype.remove = function(key, callback) {
	if(this.__cache[key]) delete this.__cache[key];
	return callback(null);
};