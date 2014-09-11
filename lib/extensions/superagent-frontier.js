var crypto = require('crypto');

module.exports = function(superagent) {
	var Request = superagent.Request;

	Request.prototype.sign = function(application) {
		this.frontier = true;
		this.privatekey = application.privatekey || application;

		return this;
	};

	Request.prototype.cache = function(cache, key, alwaysRequest) {
		var oldEnd = this.end;

		this.end = (function(fn) {
			var newCallback = (function(err, res) {
				if(err) return fn(err);
				if(res.statusCode !== 200) return fn(err, res);
				if(this.frontier && this.privatekey && !res.signed) return fn(new Error('Server response was not signed'), res);

				if(!key) cache.setMulti(res.body, res.header['x-expires'], function() {
					return fn(err, res);
				});
				else cache.set(key, res.header['x-expires'], res.body, function() {
					return fn(err, res);
				});
			}).bind(this);

			if(!key || alwaysRequest) oldEnd.call(this, newCallback);
			else cache.get(key, (function(err, result) {
				if(err || !result) return oldEnd.call(this, newCallback);
				fn(null, {
					statusCode: 200,
					signed: true,
					body: result
				});
			}).bind(this));
		}).bind(this);

		return this;
	};

	var oldEnd = Request.prototype.end;
	Request.prototype.end = function(fn) {
		if(this.frontier && this.privatekey) {
			var newCallback = (function(err, res) {
				if(err) {
					res.signed = false;
					if(fn.length === 1) return fn(res);
					return fn(err, res);
				}

				ValidateResponse(this, res, this.privatekey);

				if(fn.length === 1) return fn(res);
				return fn(err, res);
			}).bind(this);

			this.timestamp = (new Date()).getTime().toString();

			var req = this.request();

			this.hash = crypto.createHash('sha512')
						.update(this.privatekey)
						.update(this.timestamp.toString())
						.update(req.path)
						.update(req.query || '')
						.update(this._data ? JSON.stringify(this._data) : '')
						.digest('hex');

			req.setHeader('X-Time', this.timestamp);
			req.setHeader('X-Hash', this.hash);

			return oldEnd.call(this, newCallback);
		}

		return oldEnd.call(this, fn);
	};
}

function ValidateResponse(request, res, privatekey) {
	var req = request.request();

	if(!res.header['x-expires']) {
		res.signed = false;
		return;
	}

	var hash = crypto.createHash('sha512')
				.update(privatekey)
				.update(res.header['x-expires'])
				.update(request.timestamp)
				.update(request.hash)
				.update(req.path)
				.update(req.query || '')
				.update(res.text)
				.digest('hex');

	res.signed = res.header['x-hash'] == hash;
}