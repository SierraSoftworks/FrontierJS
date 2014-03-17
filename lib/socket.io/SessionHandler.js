var parseCookie = require('connect').utils.parseCookie;

module.exports =  SessionHandler;

function SessionHandler(application) {
	return function(data, callback) {
		var cookies = {};
		if(data.headers.cookie) cookies = parseCookie(data.headers.cookie);

		var sessionKey = cookies[application.sessionCookie] || data.headers[application.sessionHeader];
		if(!sessionKey) return callback(new Error('No session submitted in handshake request'), false);
		application.api.session.details(sessionKey, function(err, details) {
			if(err) return callback(err, false);
			if(!details) return callback(null, false);
			data.user = details;
			return callback(null, true);
		});
	}
}