var _ = require('lodash'),
	Q = require('q');

module.exports = Cache;

function Cache(store, prefix) {
	/**
	 * Creates a new cache which will store elements with a given prefix 
	 */

	this.prefix = prefix;
	this.store = store;
}

Cache.prototype.set = function(key, value, expires) {
	return this.store.set([{ key: key, value: value }], expires);
};

Cache.prototype.setArrayID = function(array, expires) {
	return this.store.set(_.map(array, function(value) { return { key: this.prefix + value.id, value: value }; }, this), expires);
};

Cache.prototype.setMap = function(map, expires) {
	return this.store.set(_.map(map, function(value, key) { return { key: this.prefix + key, value: value }; }, this), expires);
};

Cache.prototype.get = function(keys) {
	return this.store.get(_.map(keys, function(key) { return this.prefix + key }, this));
};

Cache.NoOpStore = require('./NoOpStore.js');
Cache.MemoryStore = require('./MemoryStore.js');