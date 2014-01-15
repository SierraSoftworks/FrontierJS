module.exports = SessionMiddleware;

function SessionMiddleware(application) {
	return function(req, res, next) {
		var sessionKey = req.cookies[application.sessionCookie] || req.headers[application.sessionHeader];
		if(!sessionKey) return next();
		application.api.session.details(sessionKey, function(err, details) {
			if(err) return next();
			if(!details) return next();
			req.user = details;
			return next();
		});
	}
}