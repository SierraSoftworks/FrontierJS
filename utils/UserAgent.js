var os = require('os');
require('pkginfo')(module);

var pkginfo = module.exports;

module.exports = function() {
	return "FrontierJS/" + pkginfo.version + " (" + OSVersion() + "; Node) Node.js/" + process.versions.node;
};

function OSVersion() {
	switch(os.platform()) {
		case "win32":
			return "Windows; " + os.type().replace('_', ' ') + ' ' + os.release();
		default:
			return os.platform() + '; ' + os.type() + ' ' + os.release();
	}
}