module.exports = function(application) {
	return {
		authenticate: require('./AuthHandler')(application),
		session: require('./SessionHandler')(application)
	};
};