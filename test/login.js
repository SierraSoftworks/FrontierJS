var Frontier = require('../');
var Q = require('q');
var should = require('should');

describe('Login API', function() {
	var frontier;

	before(function() {
		frontier = new Frontier('https://frontierjs.testing:cc52d5593e1beeaec7576b05ec0a366fe7787f10c8a87050de00ce6f29a848855797df8c4b249ef4c86e6a2d78061b1de4d12c2bd13d366f5985da806d2a89a8@auth.sierrasoftworks.com/');
	});

	it('should be available through the Frontier object', function() {
		should.exist(frontier.login);
	});

	describe('login', function() {
		it('should return successfully with valid credentials', function(done) {
			frontier.login({
				username: "test_runner",
				password: "test_runner"
			}).then(function(session) {
				should.exist(session);
				session.session.should.have.length(128);
				Q();
			}).then(function() { done(); }, done);
		});

		it('should return an error for an invalid username', function(done) {
			frontier.login({
				username: "testrunner_invalidusername",
				password: "wrongpassword"
			}).then(function() {
				return Q.reject(new Error('Expected an error response'));
			}, function(err) {
				err.error.should.eql('User Not Found');
				return Q();
			}).then(function() { done(); }, done);
		});

		it('should return an error for an invalid password', function(done) {
			frontier.login({
				username: "test_runner",
				password: "wrongpassword"
			}).then(function() {
				return Q.reject(new Error('Expected an error response'));
			}, function(err) {
				err.error.should.eql('Incorrect Password');
				return Q();
			}).then(function() { done(); }, done);
		});
	});
});