//Schema for Data collection on DB
var mongoose = require('mongoose'),
	schema = mongoose.Schema;

var bookingSchema = new schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	time: Date,
	distance: Number,
	location: {
		street: String,
		number: Number,
		city: String,
		country: String,
		coords: {
			type: [Number],
			index: '2d'
		}
	},
	searcherId: String,
	parkingId: String
}, {
	collection: 'bookings',
	versionKey: false
});

var model = mongoose.model('booking', bookingSchema);
console.log('Connected to smartPark.bookings\'s DB...!');
module.exports = model;
