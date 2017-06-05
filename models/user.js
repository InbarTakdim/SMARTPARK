//Schema for Data collection on DB
var mongoose = require('mongoose'),
	schema = mongoose.Schema;

var user = new schema({
	// id: {type: Number, requierd: true},
	name: String,
	email: {
		type: String,
		requierd: true
	},
	token: String,
	password: String,
	// img: String,
	smarties: Number,
	carId: Number
}, {
	collection: 'users',
	versionKey: false
});

var model = mongoose.model('user', user);
console.log('Connected to smartPark.users\'s DB...!');
module.exports = model;
