var crypto = require('crypto'),
	querystring = require('querystring'),
	_ = require('lodash');

module.exports = AuthMiddleware;

function AuthMiddleware(application) {
	/// <summary>Creates a new auth validation middleware for Express</summary>
	/// <param name="application" type="Application">The application for which the middleware is active</param>
	/// <return type="Function"/>

	return function(req, res, next) {
		if(!req.query.uid) return next();
		if(!req.query.ts) return next();
		if(!req.query.s) return next();

		var authorization = {
			user: req.query.uid,
			expires: new Date(parseInt(req.query.ts)),
			sessionkey: req.query.s
		};

		delete req.query.uid;
		delete req.query.ts;
		delete req.query.s;

		req.query.uid = authorization.user;
		var params = querystring.stringify(req.query);

		var hash = crypto.createHash('sha512')
					.update(application.privatekey)
					.update(authorization.expires.getTime().toString())
					.update(application.callback).update(params ? '?' + params : '')
					.digest('hex');

		if(hash != authorization.sessionkey) return next();

		req.authorization = authorization;
		if(application.sessionCookie)
			res.cookie(application.sessionCookie, authorization.sessionkey, { expires: authorization.expires, httpOnly: true });
		next();
	};
}

