module.exports = function(frontier) {
	require('./application.js')(frontier);
	require('./keys.js')(frontier);
	require('./login.js')(frontier);
	require('./sessions.js')(frontier);
	require('./time.js')(frontier);
};