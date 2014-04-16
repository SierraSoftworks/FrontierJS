var parseCookie = require('cookie').parse;

module.exports =  AuthHandler;

function AuthHandler(application) {
	return function(authenticate) {
		return function(req, callback) {
			var cookies = {};
			if(req.headers.cookie) cookies = parseCookie(req.headers.cookie);

			var sessionKey = cookies[application.sessionCookie] || req.headers[application.sessionHeader];
			if(!sessionKey) return callback(new Error('No session submitted in handshake request'), false);
			application.api.session.details(sessionKey, function(err, details) {
				if(err) return callback(err, false);
				if(!details) return callback(null, false);
				req.user = details;
				return authenticate(req, callback);
			});
		}
	}
}