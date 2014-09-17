describe('Keys API', function() {
	var frontier;

	before(function() {
		frontier = new Frontier(dsn);
	});

	it('should be available through the Frontier object', function() {
		should.exist(frontier.keys);
		should.exist(frontier.key);
	});

	describe('keys', function() {
		describe('get', function() {
			it('should return the list of keys available for the application', function() {
				return frontier.keys.get().then(function(keys) {
					should.exist(keys);
					Array.isArray(keys).should.be.true;
				});
			});
		});

		describe('create', function() {
			it('should allow new keys to be created', function() {
				return frontier.keys.create({
					name: 'Creation Test',
					publickey: 'testnew',
					permissions: {}
				}).then(function(key) {
					should.exist(key);
					key.name.should.eql('Creation Test');
					key.publickey.should.eql('testnew');
					key.permissions.should.eql({});
					key.privatekey.should.have.length(128);
				});
			});
		});
	});

	describe('key', function() {
		describe('get', function() {
			it('should retrieve information about the current key', function() {
				return frontier.key.get().then(function(key) {
					should.exist(key);
					key.should.have.ownProperty('name');
					key.should.have.ownProperty('privatekey');
					key.should.have.ownProperty('permissions');
				});
			});

			it('should retrieve information about a specific key', function() {
				return frontier.key.get('testkey').then(function(key) {
					should.exist(key);
					key.should.have.ownProperty('name');
					key.should.have.ownProperty('privatekey');
					key.should.have.ownProperty('permissions');
				});
			});

			it('should return an error for a missing key', function() {
				return frontier.key.reset('missingkey').then(function() {
					return Q.reject(new Error("Expected an error response for a missing key"));
				}, function(err) {
					should.exist(err);
					err.error.should.eql('Key Not Found');
					return Q.resolve();
				});
			});
		});

		describe('modify', function() {
			it('should not modify information about the admin key', function() {
				return frontier.key.modify({ name: 'Unit Tests' }).then(function(key) {
					should.exist(key);
					key.should.have.ownProperty('name');
					key.name.should.equal('Unit Tests');
					key.should.have.ownProperty('privatekey');
					key.privatekey.should.be.a('string').and.have.property('length', 128);
					key.should.have.ownProperty('permissions');
				});
			});

			it('should modify information about a specific key', function() {
				return frontier.key.modify('testkey', { name: 'Unit Tests' }).then(function(key) {
					should.exist(key);
					key.should.have.ownProperty('name');
					key.name.should.eql('Unit Tests');
					key.should.have.ownProperty('privatekey');
					key.privatekey.should.be.a('string').and.have.property('length', 128);
					key.should.have.ownProperty('permissions');
				});
			});

			it('should return an error for a missing key', function() {
				return frontier.key.reset('missingkey').then(function() {
					return Q.reject(new Error("Expected an error response for a missing key"));
				}, function(err) {
					should.exist(err);
					err.error.should.eql('Key Not Found');
					return Q.resolve();
				});
			});
		});

		describe('reset', function() {
			it('should allow resetting of the current key', function() {
				return frontier.key.reset().then(function(key) {
					should.exist(key);
					key.should.have.ownProperty('name');
					key.should.have.ownProperty('privatekey');
					key.should.have.ownProperty('permissions');
				});
			});

			it('should allow resetting of a specific key', function() {
				return frontier.key.reset('testkey').then(function(key) {
					should.exist(key);
					key.should.have.ownProperty('name');
					key.should.have.ownProperty('privatekey');
					key.should.have.ownProperty('permissions');
				});
			});

			it('should return an error for a missing key', function() {
				return frontier.key.reset('missingkey').then(function() {
					return Q.reject(new Error("Expected an error response for a missing key"));
				}, function(err) {
					should.exist(err);
					err.error.should.eql('Key Not Found');
					return Q.resolve();
				});
			});
		});

		describe('remove', function() {
			it('should not allow removal of the current key', function() {
				(function() {
					return frontier.key.remove();
				}).should.throw();
			});

			it('should allow removal of a specific key', function() {
				return frontier.key.remove('testkey').then(function(key) {
					should.exist(key);
					key.should.have.ownProperty('name');
					key.should.have.ownProperty('privatekey');
					key.should.have.ownProperty('permissions');
				});
			});

			it('should return an error for a missing key', function() {
				return frontier.key.reset('missingkey').then(function() {
					return Q.reject(new Error("Expected an error response for a missing key"));
				}, function(err) {
					should.exist(err);
					err.error.should.eql('Key Not Found');
					return Q.resolve();
				});
			});
		});
	});
});