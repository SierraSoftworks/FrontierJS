module.exports = NoOpStore;

function NoOpStore() {
	this.__cache = {};
}

NoOpStore.prototype.set = function(key, expiry, value, callback) {
	return callback(null);
};

NoOpStore.prototype.setMulti = function(keys, values, expiry, callback) {
	return callback(null);
};

NoOpStore.prototype.get = function(key, callback) {
	return callback(null, null);
};

NoOpStore.prototype.getMulti = function(keys, callback) {
	return callback(null, []]);
};

NoOpStore.prototype.remove = function(key, callback) {
	return callback(null);
};