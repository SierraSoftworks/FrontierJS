var Frontier = require('../');
var should = require('should');

describe('Keys API', function() {
	var frontier;

	before(function() {
		frontier = new Frontier('https://frontierjs.testing:cc52d5593e1beeaec7576b05ec0a366fe7787f10c8a87050de00ce6f29a848855797df8c4b249ef4c86e6a2d78061b1de4d12c2bd13d366f5985da806d2a89a8@auth.sierrasoftworks.com/');
	});

	it('should be available through the Frontier object', function() {
		should.exist(frontier.keys);
		should.exist(frontier.key);
	});

	describe('keys', function() {
		describe('get', function() {
			it('should return the list of keys available for the application', function(done) {
				frontier.keys.get().then(function(keys) {
					should.exist(keys);
					Array.isArray(keys).should.be.true;
					return done();
				}, function(err) {
					if(err.error && err.error == 'Not Allowed') return done();
					return done(err);
				});
			});
		});

		describe('create', function() {
			it('should allow new keys to be created', function(done) {
				frontier.keys.create({
					name: 'Creation Test',
					publickey: 'testnew',
					permissions: {}
				}).then(function(key) {
					should.exist(key);
					key.name.should.eql('Creation Test');
					key.publickey.should.eql('testnew');
					key.permissions.should.eql(false);
					key.privatekey.should.have.length(128);
					return done();
				}, function(err) {
					if(err.error && err.error == 'Not Allowed') return done();
					return done(err);
				});
			});
		});
	});

	describe('key', function() {
		describe('get', function() {
			it('should retrieve information about the current key', function(done) {
				frontier.key.get().then(function(key) {
					should.exist(key);
					key.publickey.should.eql('testing');
					return done();
				}, function(err) {
					if(err.error && err.error == 'Not Allowed') return done();
					return done(err);
				});
			});

			it('should retrieve information about a specific', function(done) {
				frontier.key.get('testing').then(function(key) {
					should.exist(key);
					key.publickey.should.eql('testing');
					return done();
				}, function(err) {
					if(err.error && err.error == 'Not Allowed') return done();
					return done(err);
				});
			});
		});

		describe('modify', function() {
			it('should modify information about the current key', function(done) {
				frontier.key.modify({ name: 'Unit Tests' }).then(function(key) {
					should.exist(key);
					key.publickey.should.eql('testing');
					return done();
				}, function(err) {
					if(err.error && err.error == 'Not Allowed') return done();
					return done(err);
				});
			});

			it('should modify information about a specific', function(done) {
				frontier.key.modify('testing', { name: 'Unit Tests' }).then(function(key) {
					should.exist(key);
					key.publickey.should.eql('testing');
					return done();
				}, function(err) {
					if(err.error && err.error == 'Not Allowed') return done();
					return done(err);
				});
			});
		});

		describe('reset', function() {

		});

		describe('remove', function() {

		});
	});
});