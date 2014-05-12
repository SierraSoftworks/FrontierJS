var crypto = require('crypto'),
	querystring = require('querystring'),
	_ = require('lodash'),
	debug = require('debug')('frontier:express:authenticate');

module.exports = AuthMiddleware;

function AuthMiddleware(application) {
	/// <summary>Creates a new auth validation middleware for Express</summary>
	/// <param name="application" type="Application">The application for which the middleware is active</param>
	/// <return type="Function"/>

	return function(req, res, next) {
		if(!req.query.uid) {
			debug('Failed due to missing UID');
			return next();
		}
		if(!req.query.ts) {
			debug('Failed due to missing timestamp');
			return next();
		}
		if(!req.query.s) {
			debug('Failed due to missing hash');
			return next();
		}

		try {
			req.query.ts = parseInt(req.query.ts);
		} catch(err) {
			debug('Failed due to badly formatted timestamp: %s', req.query.ts);
			return next();
		}

		var authorization = {
			user: req.query.uid,
			expires: new Date(req.query.ts),
			sessionkey: req.query.s
		};

		delete req.query.ts;
		delete req.query.s;

		var params = querystring.stringify(req.query);
		params = params ? '?' + params : '';

		var hash = crypto.createHash('sha512')
					.update(application.privatekey)
					.update(authorization.expires.getTime().toString())
					.update(application.callback).update(params)
					.digest('hex');

		if(hash != authorization.sessionkey) {
			debug('Failed due to hashes not matching: %s vs. %s', authorization.sessionkey, hash);
			return next();
		}

		req.authorization = authorization;
		if(application.sessionCookie)
			res.cookie(application.sessionCookie, authorization.sessionkey, { expires: authorization.expires, httpOnly: true });
		next();
	};
}

