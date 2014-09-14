var _ = require('lodash');

module.exports = Cache;

function Cache(store, prefix) {
	/**
	 * Creates a new cache which will store elements with a given prefix 
	 */

	this.prefix = prefix;
	this.store = store;
}

Cache.prototype.set = function(key, value, expires, done) {
	return this.store.set([{ key: key, value: value }], expires, done);
};

Cache.prototype.setArrayID = function(array, expires, done) {
	return this.store.set(_.map(array, function(value) { return { key: this.prefix + value.id, value: value }; }, this), expires, done);
};

Cache.prototype.setMap = function(map, expires, done) {
	return this.store.set(_.map(map, function(value, key) { return { key: this.prefix + key, value: value }; }, this), expires, done);
};

Cache.prototype.get = function(keys, done) {
	return this.store.get(_.map(keys, function(key) { return this.prefix + key }, this), done);
};

Cache.NoOpStore = require('./NoOpStore.js');