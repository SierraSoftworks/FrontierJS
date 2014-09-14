module.exports = MyStore;

function MyStore() {}

MyStore.prototype.set = function(objects, expires, done) {
	/**
	 * Stores objects in the store, @objects is in the form [{ key: String, value: Object }]
	 * and should expire after @expires milliseconds. Call @done() when you're finished setting
	 * values, or @done(err) if you encounter a problem.
	 */

	 done(new Error("Method not implemented"));
};

MyStore.prototype.get = function(keys, done) {
	/**
	 * Retrieves objects from the store, should call @done(null, [value1, value2]) where
	 * values correspond to the @keys index of the key that retrieved that value.
	 * If you experience a cache miss, return null for that value and the system will
	 * automatically handle it.
	 * Call @done(err) if you encounter a problem.
	 */

	 done(new Error("Method not implemented"));
};