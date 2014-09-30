var fn = require('functionality'),
	url = require('url'),
	Http = require('./http'),
	Cache = require('./cache'),
	debug = require('debug')('frontier:core');

module.exports = Frontier;

function Frontier() {
	fn.on(String, function(dsn) {
		debug(dsn);
		dsn = url.parse(dsn, true);
		this.context.server = dsn.protocol + (dsn.slashes ? '//' : '') + dsn.host;

		this.context.protocol = /^https?:$/.test(dsn.protocol) ? dsn.protocol.substring(0, dsn.protocol.length - 1) : 'https';

		if(dsn.auth) {
			this.context.publickey = dsn.auth.split(':')[0];
			this.context.privatekey = dsn.auth.split(':')[1];
		}
	}).on(Object, function(options) {
		var server = url.parse(options.server);
		this.context.server = server.protocol + (server.slashes ? '//' : '') + server.host;

		this.context.protocol = /^https?:$/.test(server.protocol) ? server.protocol.substring(0, server.protocol.length - 1) : 'https';

		this.context.publickey = options.publickey;
		this.context.privatekey = options.privatekey;

		this.context.callback = options.callback;

		this.context.store = options.store;
		this.context.sessionCookie = options.sessionCookie || '_frontier';
		this.context.sessionHeader = options.sessionHeader || 'x-frontier';
	}).execute(this, arguments);

	debug('Created %s client', this.protocol);

	this.store = this.store || new Cache.MemoryStore();
	this.client = new Http(this, require(this.protocol));
	require('./api')(this);
}

Frontier.prototype = {
	get app_id() {
		if(!this.publickey) return null;
		return this.publickey.split('.')[0];
	},
	get token() {
		if(!this.publickey) return null;
		var s = this.publickey.split('.');
		return s.length > 1 && s[1];
	}
}