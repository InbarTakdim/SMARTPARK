//Connect to MongoDB on mLab via Mongoose
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var config = {
	mongoUrl: 'mongodb://db_usr:db_pass@ds155961.mlab.com:55961/smartparkapp'
}
console.log('connecting...');

//The server option auto_reconnect is defaulted to true
var options = {
	server: {
		auto_reconnect: true,
	}
};
mongoose.connect(config.mongoUrl, options);

db = mongoose.connection; // NOTE:  a global connection variable

// Events handlers for Mongoose
db.on('error', err => console.log(`Mongoose: Error: ${err}`));
db.on('open', () => console.log(`Mongoose: Connection established`));
db.on('disconnected', () => {
	console.log('Mongoose: Connection stopped, recconect');
	mongoose.connect(config.mongoUrl, options);
});
db.on('reconnected', () => console.info('Mongoose reconnected!'));
