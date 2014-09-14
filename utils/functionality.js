var Q = require('q');

module.exports = {
	promises: {
		first: function() {
			this.deferred = Q.defer();
			this.resolve = this.deferred.resolve;
			this.reject = this.deferred.reject;
			this.addCallback = function(callback) {
				if(!callback) return;
				this.deferred.promise.then(function(result) {
					callback(null, result);
				}, function(err) {
					callback(err);
				});
			};
			this.pipePromise = function(promise) {
				var deferred = this.deferred;
				promise.then(function(result) {
					deferred.resolve(result);
				}, function(err) {
					deferred.reject(err);
				}, function(progress) {
					deferred.notify(progress);
				});
			};
		},
		then: function() {
			return this.deferred.promise;
		}
	}
};