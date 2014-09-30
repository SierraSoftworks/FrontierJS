var _ = require('lodash'),
	Q = require('q');

module.exports = NoOpStore;

function NoOpStore() {}

NoOpStore.prototype.set = function(objects, expires) {
	/**
	 * Stores objects in the store, @objects is in the form [{ key: String, value: Object }]
	 * and should expire after @expires milliseconds. Call @done() when you're finished setting
	 * values, or @done(err) if you encounter a problem.
	 */

	 return Q();
};

NoOpStore.prototype.get = function(keys) {
	/**
	 * Retrieves objects from the store, should call @done(null, [value1, value2]) where
	 * values correspond to the @keys index of the key that retrieved that value.
	 * If you experience a cache miss, return null for that value and the system will
	 * automatically handle it.
	 * Call @done(err) if you encounter a problem.
	 */

	 return Q(_.map(keys, function() { return null; }));
};