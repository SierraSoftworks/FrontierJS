var url = require('url');

module.exports = function(application) {
	return {
		authenticate: require('./AuthMiddleware')(application),
		session: require('./SessionMiddleware')(application),
		login: function(req, res) {
			return res.redirect(url.resolve(application.server, application.appid, 'auth'));
		}
	};
};