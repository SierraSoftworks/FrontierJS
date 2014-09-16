var Frontier = require('../');
var Q = require('q');
var should = require('should');

describe('Login API', function() {
	var frontier;

	before(function() {
		frontier = new Frontier(require('./config').dsn);
	});

	it('should be available through the Frontier object', function() {
		should.exist(frontier.login);
	});

	describe('login', function() {
		it('should return successfully with valid credentials', function(done) {
			frontier.login({
				username: "testuser",
				password: "testuser"
			}).then(function(session) {
				should.exist(session);
				session.session.should.have.length(128);
				Q();
			}).then(function() { done(); }, done);
		});

		it('should return an error for an invalid username', function(done) {
			frontier.login({
				username: "testuser_invalidusername",
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
				username: "testuser",
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