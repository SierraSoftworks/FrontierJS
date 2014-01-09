# Frontier JavaScript Client
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
	sessionCookie: '_frontier' // Default
};

var myApp = new Frontier.Application(options);
```

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

## Express Middleware
This module includes two express middlewares which are designed to be used together when implementing Frontier authentication in your application. They are the `Authentication Middleware` and `Session Middleware` and they are responsible for processing and verifying the authentication callback's requests and checking session keys respectively.

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