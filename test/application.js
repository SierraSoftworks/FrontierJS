var Frontier = require('../');
var should = require('should');

describe('Application API', function() {
	var frontier;

	before(function() {
		frontier = new Frontier(require('./config').dsn);
	});

	it('should be available through the Frontier object', function() {
		should.exist(frontier.applications);
		should.exist(frontier.application);
	});

	describe('applications', function() {
		describe('get', function() {
			it('should return the list of applications available on the server', function(done) {
				frontier.applications.get().then(function(apps) {
					should.exist(apps);
					Array.isArray(apps).should.be.true;
					return done();
				}, done);
			});
		});
	});

	describe('application', function() {
		describe('get', function() {
			it('should get information about the current application', function(done) {
				frontier.application.details().then(function(app) {
					should.exist(app);
					app.id.should.eql('frontierjs');
					return done();
				}, done);
			});

			it('should get information about a specific application', function(done) {
				frontier.application.details('frontierjs').then(function(app) {
					should.exist(app);
					app.id.should.eql('frontierjs');
					return done();
				}, done);
			});
		});

		describe('modify', function() {
			it('should allow modification of the application details', function(done) {
				frontier.application.modify({
					logo: '/icon.svg',
					website: 'https://github.com/sierrasoftworks/frontierjs'
				}).then(function(app) {
					should.exist(app);
					app.id.should.eql('frontierjs');
					return done();
				}, function(err) {
					if(err.error && err.error == 'Not Allowed') return done();
					return done(err);
				});
			});
		});

		describe('remove', function() {
			it('should allow removal of the application', function(done) {
				frontier.application.remove().then(function() {
					return done();
				}, function(err) {
					if(err.error && err.error == 'Not Allowed') return done();
					return done(err);
				});
			});
		});
	});
});