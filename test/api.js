var Frontier = require('../'),
	should = require('should');

var app = new Frontier.Application({
	server: 'https://auth.sierrasoftworks.com',
	id: 'frontierjs',
	privatekey: 'a601411b2ab34d9a17eef155af28a7c3f59f1ff313efb5bd14758a252a3c0c4cce4fece046639091f9c1bb07f5ec8092652cf71881256ce57d79de0e4dbc73d4',
	callback: 'https://sierrasoftworks.com/frontierjs',
	store: new Frontier.NoOpStore()
});

var session = null;

describe('login', function() {
	this.timeout(30000);
	it('should respond with a 203 for an invalid username', function(done) {
		app.api.login('invalidUsername', 'somePassword', 'Mocha Test', function(err, response) {
			should.exist(err);
			err.should.have.ownProperty('error').and.eql('User Not Found');
			response.statusCode.should.eql(404);
			done();
		});
	});

	it('should respond with a 204 for an invalid password', function(done) {
		app.api.login('test_runner', 'wrongPassword', 'Mocha Test', function(err, response) {
			should.exist(err);
			err.should.have.ownProperty('error').and.eql('Incorrect Password');
			response.statusCode.should.eql(401);
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
	this.timeout(30000);
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

	describe('user', function(done) {
		it('should respond with null for an invalid session key', function(done) {
			app.api.session.user(session.substring(1) + 'a', function(err, username) {
				should.not.exist(err);
				should.not.exist(username);
				done();
			});
		});

		it('should respond with the correct username for a valid session key', function(done) {
			app.api.session.user(session, function(err, username) {
				should.not.exist(err);
				should.exist(username);
				username.should.eql('test_runner');
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
	this.timeout(30000);
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

describe('permissions', function() {
	this.timeout(30000);

	it('assignment should return the new permissions', function(done) {
		app.api.permissions.assign('test_runner', { access: true }, function(err, permissions) {
			should.not.exist(err);
			permissions.should.eql({access:true});
			done();
		});
	});

	it('should retrieve the user\s permissions', function(done) {
		app.api.permissions.get('test_runner', function(err, permissions) {
			should.not.exist(err);
			permissions.should.eql({ access: true });
			done();
		});
	});

	it('grant should merge permissions correctly', function(done) {
		app.api.permissions.grant('test_runner', { write: true }, function(err, permissions) {
			should.not.exist(err);
			permissions.should.eql({ access: true, write: true });
			done();
		});
	});

	it('revoke should merge permissions correctly', function(done) {
		app.api.permissions.revoke('test_runner', { access: false }, function(err, permissions) {
			should.not.exist(err);
			permissions.should.eql({ write: true });
			done();
		});
	});
});

describe('accounts', function() {
	this.timeout(30000);

	it('should be able to retrieve the user\'s account', function(done) {
		app.api.account.get('test_runner', function(err, account) {
			should.not.exist(err);
			should.exist(account);
			account.should.have.ownProperty('id').and.equal('test_runner');
			account.should.have.ownProperty('details');
			account.should.have.ownProperty('permissions');
			account.should.have.ownProperty('tags');

			done();
		});
	});

	it('should be able to retrieve the accounts of a number of users', function(done) {
		app.api.account.get('-admin', function(err, account) {
			should.not.exist(err);
			should.exist(account);
			account.should.have.ownProperty('test_runner');
			account = account.test_runner;
			account.should.have.ownProperty('id').and.equal('test_runner');
			account.should.have.ownProperty('details');
			account.should.have.ownProperty('permissions');
			account.should.have.ownProperty('tags');

			done();
		});
	});
});

describe('details', function() {
	this.timeout(30000);

	it('should return the details of a specific user', function(done) {
		app.api.details.get('test_runner', function(err, details) {
			should.not.exist(err);
			should.exist(details);

			details.should.have.ownProperty('fullname');
			details.should.have.ownProperty('email');
			details.should.have.ownProperty('avatar');
			details.should.have.ownProperty('birthdate');
			done();
		});
	});

	it('should return the details of users matching tags', function(done) {
		app.api.details.get('-admin', function(err, details) {
			should.not.exist(err);
			should.exist(details);

			details.should.have.ownProperty('test_runner');
			details = details.test_runner;
			details.should.have.ownProperty('fullname');
			details.should.have.ownProperty('email');
			details.should.have.ownProperty('avatar');
			details.should.have.ownProperty('birthdate');
			done();
		});
	});
});