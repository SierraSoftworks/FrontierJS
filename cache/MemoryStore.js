var _ = require('lodash'),
	Q = require('q');

module.exports = MemoryStore;

function MemoryStore() {
	this.data = {};
}

MemoryStore.prototype.set = function(objects, expires) {
	/**
	 * Stores objects in the store, @objects is in the form [{ key: String, value: Object }]
	 * and should expire after @expires milliseconds. Call @done() when you're finished setting
	 * values, or @done(err) if you encounter a problem.
	 */

	 _.forEach(objects, function(obj) {
	 	this.data[obj.key] = { val: obj.value, exp: new Date().getTime() + expires };
	 }, this);

	 return Q();
};

MemoryStore.prototype.get = function(keys) {
	/**
	 * Retrieves objects from the store, should call @done(null, [value1, value2]) where
	 * values correspond to the @keys index of the key that retrieved that value.
	 * If you experience a cache miss, return null for that value and the system will
	 * automatically handle it.
	 * Call @done(err) if you encounter a problem.
	 */

	 var now = new Date().getTime();
	 return Q(_.map(keys, function(key) {
	 	var obj = this.data[key];
	 	if(obj && obj.expires > now) return obj.val;
	 	if(obj) delete this.data[key];
	 	return null;
	 }), this);
};