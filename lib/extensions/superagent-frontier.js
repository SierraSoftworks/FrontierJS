var crypto = require('crypto');

module.exports = function(superagent) {
	var Request = superagent.Request;

	Request.prototype.sign = function(application) {
		this.frontier = true;
		this.privatekey = application.privatekey || application;

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