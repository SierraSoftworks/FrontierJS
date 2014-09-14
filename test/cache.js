var should = require('should');

var Cache = require('../cache');

describe('cache', function() {
	function TestStore() {
		this.data = {};
		this.links = {};
	}

	TestStore.prototype.set = function(objects, expires, done) {
		for(var i = 0; i < objects.length; i++)
			this.data[objects[i].key] = { value: objects[i].value, expires: expires };
		done();
	};

	TestStore.prototype.get = function(keys, done) {
		var values = [];
		for(var i = 0; i < keys.length; i++)
			values.push(this.data[keys[i]] ? this.data[keys[i]].value : null);
		return done(null, values);
	};

	var store = new TestStore();

	it('should correctly store values', function(done) {
		var cache = new Cache(store, '');

		cache.set('a', 1, 10, function(err) {
			should.not.exist(err);
			store.data.should.have.ownProperty('a').and.eql({ value: 1, expires: 10 });

			done();
		});
	});

	it('should correctly store values from a map', function(done) {
		var cache = new Cache(store, '');

		cache.setMap({ x: 1, y: 2 }, 10, function(err) {
			should.not.exist(err);
			store.data.should.have.ownProperty('x').and.eql({ value: 1, expires: 10 });
			store.data.should.have.ownProperty('y').and.eql({ value: 2, expires: 10 });

			done();
		});
	});

	it('should correctly store values from an array with ids', function(done) {
		var cache = new Cache(store, '');

		cache.setArrayID([{ id: 'z', val: 1 }, { id: 'h', val: 2 }], 10, function(err) {
			should.not.exist(err);
			store.data.should.have.ownProperty('z').and.eql({ value: { id: 'z', val: 1 }, expires: 10 });
			store.data.should.have.ownProperty('h').and.eql({ value: { id: 'h', val: 2 }, expires: 10 });

			done();
		});
	});

	it('should correctly handle prefixes', function(done) {
		var cache = new Cache(store, 'pf:');

		cache.setArrayID([{ id: 'x', val: 2 }, { id: 'y', val: 3 }], 10, function(err) {
			should.not.exist(err);
			store.data.should.have.ownProperty('pf:x').and.eql({ value: { id: 'x', val: 2 }, expires: 10 });
			store.data.should.have.ownProperty('pf:y').and.eql({ value: { id: 'y', val: 3 }, expires: 10 });

			cache.get(['x', 'y'], function(err, data) {
				should.not.exist(err);
				data[0].should.eql({ id: 'x', val: 2 });
				data[1].should.eql({ id: 'y', val: 3 })
			});

			done();
		});
	});
});