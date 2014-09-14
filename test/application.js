var Frontier = require('../');
var should = require('should');

describe('Application API', function() {
	var frontier;

	before(function() {
		frontier = new Frontier('https://frontierjs.testing:cc52d5593e1beeaec7576b05ec0a366fe7787f10c8a87050de00ce6f29a848855797df8c4b249ef4c86e6a2d78061b1de4d12c2bd13d366f5985da806d2a89a8@auth.sierrasoftworks.com/');
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