describe('Time API', function() {
	var frontier;

	before(function() {
		frontier = new Frontier(dsn);
	});

	it('should be available through the Frontier object', function() {
		frontier.should.respondTo('time');
	});

	describe('time', function() {
		it('should return successfully with a valid timestamp', function() {
			return frontier.time().then(function(timestamp) {
				should.exist(timestamp)
				timestamp.should.be.a('number');
			});
		});
	});
});