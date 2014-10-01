var Cache = require('../cache');

describe('cache', function() {
	function TestStore() {
		this.data = {};
		this.links = {};
	}

	TestStore.prototype.set = function(objects, expires) {
		for(var i = 0; i < objects.length; i++)
			this.data[objects[i].key] = { value: objects[i].value, expires: expires };
		return Q();
	};

	TestStore.prototype.get = function(keys) {
		var values = [];
		for(var i = 0; i < keys.length; i++)
			values.push(this.data[keys[i]] ? this.data[keys[i]].value : null);
		return Q(values);
	};

	var store = new TestStore();

	it('should correctly store values', function() {
		var cache = new Cache(store, '');

		return cache.set('a', 1, 10).then(function() {
			store.data.should.have.ownProperty('a');
			store.data.a.should.be.like({ value: 1, expires: 10 });
		});
	});

	it('should correctly store values from a map', function() {
		var cache = new Cache(store, '');

		return cache.setMap({ x: 1, y: 2 }, 10).then(function() {
			store.data.should.have.ownProperty('x');
			store.data.x.should.be.like({ value: 1, expires: 10 });
			store.data.should.have.ownProperty('y');
			store.data.y.should.be.like({ value: 2, expires: 10 });
		});
	});

	it('should correctly store values from an array with ids', function() {
		var cache = new Cache(store, '');

		return cache.setArrayID([{ id: 'z', val: 1 }, { id: 'h', val: 2 }], 10).then(function() {
			should.not.exist();
			store.data.should.have.ownProperty('z');
			store.data.z.should.be.like({ value: { id: 'z', val: 1 }, expires: 10 });
			store.data.should.have.ownProperty('h');
			store.data.h.should.be.like({ value: { id: 'h', val: 2 }, expires: 10 });
		});
	});

	it('should correctly handle prefixes', function() {
		var cache = new Cache(store, 'pf:');

		return cache.setArrayID([{ id: 'x', val: 2 }, { id: 'y', val: 3 }], 10).then(function() {
			store.data.should.have.ownProperty('pf:x');
			store.data['pf:x'].should.be.like({ value: { id: 'x', val: 2 }, expires: 10 });
			store.data.should.have.ownProperty('pf:y');
			store.data['pf:y'].should.be.like({ value: { id: 'y', val: 3 }, expires: 10 });

			return cache.get(['x', 'y']);
		}).then(function(data) {
			data[0].should.be.like({ id: 'x', val: 2 });
			data[1].should.be.like({ id: 'y', val: 3 })
		});
	});
});