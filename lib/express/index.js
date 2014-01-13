var url = require('url'),
	querystring = require('querystring');

module.exports = function(application) {
	return {
		authenticate: require('./AuthMiddleware')(application),
		session: require('./SessionMiddleware')(application),
		login: function(req, res, params) {
			var ps = '';
			if(!params) ps = '';
			else if('string' == typeof params) ps = params;
			else ps = '?' + querystring.stringify(params);

			return res.redirect(url.resolve(application.server, application.appid + '/auth' + ps));
		}
	};
};