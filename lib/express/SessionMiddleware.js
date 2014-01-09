module.exports = SessionMiddleware;

function SessionMiddleware(application) {
	return function(req, res, next) {
		if(!req.cookie[application.sessionCookie]) return next();
		application.api.session.details(req.cookie[application.sessionCookie], function(err, details) {
			if(err) return next();
			if(!details) return next();
			req.user = details;
			return next();
		});
	}
}