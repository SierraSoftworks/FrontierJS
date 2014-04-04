module.exports = NoOpStore;

function NoOpStore() {
	this.__cache = {};
}

NoOpStore.prototype.set = function(key, expiry, value, callback) {
	return callback(null);
};

NoOpStore.prototype.get = function(key, callback) {
	return callback(null, null);
};

NoOpStore.prototype.remove = function(key, callback) {
	return callback(null);
};