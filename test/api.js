var Frontier = require('../'),
	should = require('should');

var app = new Frontier.Application({
	server: 'http://auth.sierrasoftworks.com',
	id: 'frontierjs',
	privatekey: 'a601411b2ab34d9a17eef155af28a7c3f59f1ff313efb5bd14758a252a3c0c4cce4fece046639091f9c1bb07f5ec8092652cf71881256ce57d79de0e4dbc73d4',
	callback: 'https://sierrasoftworks.com/frontierjs'
});

var session = null;

describe('login', function() {
	this.timeout(5000);
	it('should respond with a 203 for an invalid username', function(done) {
		app.api.login('invalidUsername', 'somePassword', 'Mocha Test', function(err, response) {
			should.exist(err);
			err.should.have.ownProperty('error').and.eql('Invalid Username');
			response.statusCode.should.eql(404);
			done();
		});
	});

	it('should respond with a 204 for an invalid password', function(done) {
		app.api.login('test_runner', 'wrongPassword', 'Mocha Test', function(err, response) {
			should.exist(err);
			err.should.have.ownProperty('error').and.eql('Invalid Password');
			response.statusCode.should.eql(403);
			done();
		});
	});

	it('should respond with a session key if the user is valid', function(done) {
		app.api.login('test_runner', 'test_runner', 'Mocha Test', function(err, response) {
			should.not.exist(err);
			response.should.have.ownProperty('session');
			session = response.session;
			done();
		});
	});
});

describe('sessions', function() {
	this.timeout(5000);
	describe('check', function(done) {		
		it('should respond with false for an invalid session key', function(done) {
			app.api.session.check(session.substring(1) + 'a', function(err, valid) {
				should.not.exist(err);
				valid.should.be.false;
				done();
			});
		});

		it('should respond with true for a valid session key', function(done) {
			app.api.session.check(session, function(err, valid) {
				should.not.exist(err);
				valid.should.be.true;
				done();
			});
		});
	});

	describe('details', function(done) {
		it('should respond with the username, permissions and tags associated with a session', function(done) {
			app.api.session.details(session, function(err, details) {
				should.not.exist(err);
				details.should.have.ownProperty('id').and.eql('test_runner');
				details.should.have.ownProperty('permissions');
				details.should.have.ownProperty('tags');
				done();
			});
		});
	});

	describe('close', function(done) {
		it('should close a session', function(done) {
			app.api.session.close(session, function(err, res) {
				should.not.exist(err);

				app.api.session.check(session, function(err, valid) {
					should.not.exist(err);
					valid.should.be.false;
					done();
				});
			});
		});
	});
});

describe('tags', function() {
	this.timeout(5000);
	it('assignment should return the new tags', function(done) {
		app.api.tags.assign('test_runner', ['mocha', 'nodejs'], function(err, tags) {
			should.not.exist(err);
			tags.should.eql(['mocha', 'nodejs']);
			done();
		});
	});

	it('get should return the user\'s tags', function(done) {
		app.api.tags.get('test_runner', function(err, tags) {
			should.not.exist(err);
			tags.should.eql(['mocha', 'nodejs']);
			done();
		});
	});

	it('addition should not add duplicate tags', function(done) {
		app.api.tags.add('test_runner', ['nodejs', 'frontierjs'], function(err, tags) {
			should.not.exist(err);
			tags.should.eql(['mocha', 'nodejs', 'frontierjs']);
			done();
		});
	});

	it('remove should remove only matched tags', function(done) {
		app.api.tags.remove('test_runner', 'mocha', function(err, tags) {
			should.not.exist(err);
			tags.should.eql(['nodejs', 'frontierjs']);
			done();
		});
	});
});