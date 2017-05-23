//Connect to MongoDB on mLab via Mongoose
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var config = {
	mongoUrl: 'dbUser:dbUser@ds151431.mlab.com:51431/smartpark'
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
