describe('Sessions API', function() {
	var frontier;

	before(function() {
		frontier = new Frontier(dsn);
	});

	it('should be available through the Frontier object', function() {
		should.exist(frontier.session);
		should.exist(frontier.sessions);
	});

	describe('sessions', function() {
		describe('get', function() {
			it("should return the user's sessions", function() {
				return frontier.sessions.get("testuser").then(function(sessions) {
					should.exist(sessions);
					Array.isArray(sessions).should.be.true;

				});
			});

			it('should return a 404 error if the user was not found', function() {
				return frontier.sessions.get('testuser_invalidusername').then(function() {
					return Q.reject("Expected a 404 error to be returned");
				}, function(err) {
					err.error.should.eql("User Not Found");
					return Q();
				});
			});
		});

		describe('close', function() {
			it("should invalidate all of the user's sessions for the current application", function() {
				return frontier.sessions.close('testuser');
			});

			it("should return a 404 error if the user was not found", function() {
				return frontier.sessions.close('testuser_invalidusername').then(function() {
					return Q.reject(new Error("Expected a 404 error to be returned"));
				}, function(err) {
					err.error.should.eql("User Not Found");
					return Q();
				});
			});
		});
	});

	describe('session', function() {
		describe('valid', function() {
			it("should return successfully if the session is valid", function() {
				return frontier.session.valid("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
			});

			it('should return a 404 error if the session was not found', function() {
				return frontier.session.valid('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdea').then(function() {
					return Q.reject(new Error("Expected a 404 error to be returned"));
				}, function(err) {
					return Q();
				});
			});
		});

		describe('user', function() {
			it("should return successfully if the session is valid with the user's ID", function() {
				return frontier.session.user("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef").then(function(username) {
					username.should.eql('testuser');
				});
			});

			it('should return a 404 error if the session was not found', function() {
				return frontier.session.user('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdea').then(function() {
					return Q.reject(new Error("Expected a 404 error to be returned"));
				}, function(err) {
					err.error.should.eql("Session Not Found");
					return Q();
				});
			});
		});
	});
});