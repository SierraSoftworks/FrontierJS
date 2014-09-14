var debug = require('debug')('frontier:hash');
module.exports = HashDebug;

function HashDebug(hash) {
	this.hash = hash;
	this.data = "";
};

HashDebug.prototype.update = function(data) {
	this.hash.update(data);
	this.data += data;
	return this;
};

HashDebug.prototype.digest = function(format) {
	var hash = this.hash.digest(format);
	debug('%s => %s', this.data, hash);
	return hash;
};