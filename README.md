# Frontier JavaScript Client [![Build Status](https://travis-ci.org/SierraSoftworks/FrontierJS.png?branch=master)](https://travis-ci.org/SierraSoftworks/FrontierJS) [![](https://badge.fury.io/js/frontier-client.png)](https://npmjs.org/package/frontier-client)
**Include Frontier Authentication Support In Your Application**

This module makes it trivial to include Frontier authentication support in your next application, with an easy to use API wrapper which automatically signs requests and validates and caches responses according to the server's preferences.

## Application
The core of the Frontier client is an Application instance, which is responsible for delegating all API calls and creating the required Express middlewares you will be using. When creating an application instance, you need to provide an `options` object with a number of configuration details which are used to ensure everything works smoothly.

The default `MemoryStore` is extremely fast, however it isn't the best option if you're looking to scale your application horizontally - in which case you should look at implementing a custom store based on something like Redis.

```javascript
var requiredOptions = {
	server: 'http://auth.sierrasoftworks.com',

	id: 'app_id',
	privatekey: 'private_key',
	callback: 'http://myapp.com/auth'
};

var extraOptions = {
	store: new Frontier.MemoryStore(), // Default
	sessionCookie: '_frontier', // Default
	sessionHeader: 'x-frontier' // Default
};

var myApp = new Frontier.Application(options);
```

### Options
 - **server** allows you to specify the web address of the authentication server you plan to be using for your users. If you have your own Frontier server, or a custom server which implements the Frontier API, you can specify it here.
 - **id** is your application's unique identifier, you can view this on your application's management page within Frontier.
 - **privatekey** is your application's secure private key, you can also find this on the application's management page and you should keep it secret if possible.
 - **callback** is the address of the callback you provided when registering your application with Frontier. It is used to check the validity of an authentication request and you should ensure that it is correct.

### Extra Options
 - **store** is the caching store you wish to use, the default `Frontier.MemoryStore` is useful for debugging or basic applications but doesn't scale well horizontally, or with sparse requests - you should replace it with something like Redis.
 - **sessionCookie** determines the cookie used by Frontier to store your user's authentication/session token. The default *_frontier* should suffice for most situations.
 - **sessionHeader** is useful if you are providing an API and need a better way of authenticating requests than attempting to hack cookies into them. You can use the default `x-frontier` header to provide the user's session token and the session middleware will handle the rest.


## API Methods
The Frontier API gives you a number of tools for managing your application's users - you can read the [documentation](http://auth.sierrasoftworks.com/api) for more information. This module provides a lightweight wrapper around the API with automatic response caching in line with the server's response *X-Expires* field.

### Login
If you're implementing an application which is unable to redirect the user to the Frontier login page (the preferred method of authentication) then you can use the login API to acquire a session key for the user. Take note that this will **only** allow users who have previously authorized your application to login, other users will return a **404 Not Found** error (the same as for invalid usernames).

```javascript
myApp.api.login(username, password, deviceName, function(err, response) {
	response = {
		sessionkey: 'xxxxxxxxxxx',
		expires: new Date(1234567890)
	}
});
```

### Permissions
The permissions API allows you to easily access, assign, grant and revoke permissions for specific users - or groups of tagged users. The `query` parameter can either be a username or a tag query.

```javascript
myApp.api.permissions.get(query, function(err, permissions) {});
myApp.api.permissions.assign(query, permissions, function(err, latestPermissions) {});
myApp.api.permissions.grant(query, permissions, function(err, latestPermissions) {});
myApp.api.permissions.revoke(query, permissions, function(err, latestPermissions) {});
```

### Tags
The tags API allows you to access, assign, add and remove tags from users to make managing them easier. Methods in this API accept both single tags and arrays of tags, and can be called on either a username or a tag query.

```javascript
myApp.api.tags.get(query, function(err, tags) {});
myApp.api.tags.assign(query, tags, function(err, tags) {});
myApp.api.tags.add(query, tags, function(err, tags) {});
myApp.api.tags.remove(query, tags, function(err, tags) {});
```

### Sessions
The sessions API allows you to check the validity of a session key provided by a user, allowing your application to quickly determine the identify of a user without redirecting them to the Frontier authentication portal each time.

```javascript
myApp.api.sessions.check(sessionkey, function(err, valid) {});
myApp.api.sessions.details(sessionkey, function(err, details) {});
myApp.api.sessions.close(sessionkey, function(err) {});
```

### Details
You can use the details API to quickly get a small amount of information about a user, including their name, email address and date of birth. In most cases this should be enough information for your application, however if additional info is required you should store it locally.

```javascript
myApp.api.details.get(username, function(err, details) {});
```

## Response Caching
To help improve performance of your application, Frontier allows you to cache responses from its API for a small period of time. This module includes support for caching out of the box, but the default cache store is an in-memory cache. While this is sufficient for testing, we recommend using something like Redis for production environments.

This is an example of a Redis cache store which you could use as a drop in replacement for the default MemoryStore.

```javascript
var redis = require('redis'),
	debug = require('debug')('frontier:cache:redis');

module.exports = RedisStore;
function RedisStore(options) {
	this.client = redis.createClient(options.port, options.host);
	this.prefix = options.prefix;
}

RedisStore.prototype.set = function(key, expiry, value, callback) {
	var ttl = expiry.getTime() - (new Date()).getTime();
	this.client.psetex(this.prefix + key, ttl, JSON.stringify(value), function(err) {
		if(err) debug('SETEX %s FAILED (%s)', key, err.message);
		return callback(err);
	});
};

RedisStore.prototype.get = function(key, callback) {
	this.client.get(this.prefix + key, function(err, value) {
		if(err) {
			debug('GET %s FAILED (%s)', key, err.message);
			return callback(err);
		}

		return callback(err, JSON.parse(value));
	});
};

RedisStore.prototype.remove = function(key, callback) {
	this.client.del(this.prefix + key, function(err) {
		if(err) debug('DEL %s FAILED (%s)', key, err.message);
		return callback(err);
	});
};
```

## Express Middleware
This module includes two Express middlewares which are designed to be used together when implementing Frontier authentication in your application. They are the `Authentication Middleware` and `Session Middleware` and they are responsible for processing and verifying the authentication callback's requests and checking session keys respectively.

### Authentication Middleware
The authentication middleware is designed to slot into the request sequence for your authentication route, it is responsible for validating requests to the authentication callback and setting the user's authentication cookie if everything is correct. If the request passes validation, this middleware will set the `req.authorization` property, allowing you to access the `user`, `sessionkey` and the session key's `expires` date.

The `req.authorization` object will look something like this.

```javascript
req.authorization = {
	user: 'username',
	sessionkey: 'xxxxxxxxxxxxxxx',
	expires: new Date(1234567890)
}
```

### Session Middleware
The session middleware is responsible for verifying a session cookie (if one is present) and setting the `req.user` property if it is. It automatically makes use of the cache store specified in your `application.store`, defaulting to an in-memory cache if none is provided - this means that it will generally be very fast, with a minimal impact on your application's performance.

### Example
```javascript
app = express();
var myApp = new Frontier.Application({ ... });

app.use(myApp.express.session);

app.get('/auth', myApp.express.authenticate, function(req, res) {
	if(!req.authorization) return res.send(400, 'Bad Request');

	users.has(req.authorization.user, function(err, userPresent) {
		if(err) return databaseError(req, res, err);
		if(!userPresent)
			users.create(req.authorization.user, function(err, user) {
				if(err) return databaseError(req, res, err);
				return res.redirect('/newuser');
			});
		else return res.redirect('/account');
	})
});

app.get('/account', function(req, res) {
	if(!req.user) return myApp.express.login(req, res);
	return res.render('account', { user: req.user });
});
```

## Socket.IO Middleware
This module includes a socket.io middleware which allows you to easily authenticate and link sessions within your application by simply registering `app.io.session` or `app.io.authenticate` as socket.io's authentication handler. It supports both cookie and header based authentication and integrates tightly with Frontier.js' cache system to ensure that sessions are authenticated as quickly as possible.

### Session Middleware
The session middleware is responsible for verifying whether a provided session is still valid and, if it is, setting the `socket.handshake.user` property to the result of an `api.sessions.details` call. It is useful when you want to get user information for a globally accessible socket or are simply wanting to link a socket to a specific user.

If you wish to perform some type of pre-connection authorization checks then you should rather look at using the *Authentication Middleware*.

### Authentication Middleware
The authentication middleware allows you to participate in the authentication process by providing a callback which is triggered if the session is valid, but before the socket is opened. You may then check the `handshakeData.user` to determine whether they should have access to the socket or not before calling the provided `callback` function. See the [Socket.IO Authorizing](https://github.com/LearnBoost/socket.io/wiki/Authorizing) documentation for more information.

### Example
```javascript
var io = require('socket.io').listen(80);
var myApp = new Frontier.Application({ ... });

io.set('authorization', myApp.io.session);

io.sockets.on('connection', function(socket) {
	var user = socket.handshake.user;
	socket.emit('ready');
});

io.of('/admin').authorization(myApp.io.authenticate(function(data, callback) {
	if(!~data.user.tags.indexOf('admin')) return callback(null, false);
	return callback(null, true);
})).on('connection', function(socket) {
	socket.emit('ready');
});
```