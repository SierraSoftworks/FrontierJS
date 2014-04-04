module.exports = {
	superagent: require('./lib/extensions/superagent-frontier'),
	Application: require('./lib/Application'),
	MemoryStore: require('./lib/stores/MemoryStore'),
	NoOpStore: require('./lib/stores/NoOpStore')
}