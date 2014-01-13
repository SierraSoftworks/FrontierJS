var crypto = require('crypto'),
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

		var params = _.map(session.query, function(value, key) {
							return key + '=' + value;
						}).join('&');

		params = (params ? '?' : '') + params;
		params = params + (params ? '&' : '?') + 'uid=' + user.username;

		var hash = crypto.createHash('sha512')
					.update(application.privatekey)
					.update(req.query.ts)
					.update(application.callback).update(params)
					.digest('hex');

		if(hash != authorization.sessionkey) return next();

		req.authorization = authorization;
		if(application.sessionCookie)
			res.cookie(application.sessionCookie, authorization.sessionkey, { expiry: authorization.expires.getTime(), httpOnly: true });
		next();
	};
}

