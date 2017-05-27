//Schema for Data collection on DB
var mongoose = require('mongoose'),
	schema = mongoose.Schema;

var parkingSchema = new schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	time: Date,
	occupied: Boolean,
	location: {
		street: String,
		number: String,
		city: String,
		country: String,
		coords: {
			type: [Number],
			spherical: true
		}
	},
	handicapped: Boolean,
	description: String,
	img: String,
	size: Number,
	publisherId: String
}, {
	collection: 'parkings',
	versionKey: false
});

var model = mongoose.model('parking', parkingSchema);
console.log('Connected to smartPark.parkings\'s DB...!');
module.exports = model;
