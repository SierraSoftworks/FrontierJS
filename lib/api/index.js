module.exports = function(application) { 
	return {
		session: require('./Sessions')(application),
		permissions: require('./Permissions')(application),
		tags: require('./Tags')(application),
		details: require('./Details')(application),
		login: require('./Login')(application),
		account: require('./Account')(application)
	};
}