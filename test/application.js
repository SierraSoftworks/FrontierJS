var Frontier = require('../');
var should = require('should'),
	Q = require('q');

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
			it('should return the list of applications available on the server', function() {
				return frontier.applications.get().then(function(apps) {
					should.exist(apps);
					Array.isArray(apps).should.be.true;
				});
			});
		});
	});

	describe('application', function() {
		describe('get', function() {
			it('should get information about the current application', function() {
				return frontier.application.details().then(function(app) {
					should.exist(app);
					app.id.should.eql('test');
				});
			});

			it('should get information about a specific application', function() {
				return frontier.application.details('test').then(function(app) {
					should.exist(app);
					app.id.should.eql('test');
				});
			});
		});

		describe('modify', function() {
			it('should allow modification of the application details', function() {
				return frontier.application.modify({
					logo: '/icon.svg',
					website: 'https://github.com/sierrasoftworks/test'
				}).then(function(app) {
					should.exist(app);
					app.id.should.eql('test');
					app.logo.should.eql('/icon.svg');
					app.website.should.eql('https://github.com/sierrasoftworks/test');
				});
			});
		});

		describe('remove', function() {
			it('should allow removal of the application', function() {
				return frontier.application.remove();
			});
		});
	});
});