'use strict';
var ParkingsController = require('./controllers/parkingMDL.js'),
	userMDL = require('./controllers/userMDL.js'),
	db = require('./dbconf'),
	parkingsApi = new ParkingsController(),
	port = process.env.PORT || 8080,
	express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	http = require('http'),
	_ = require('lodash');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
//app.use('/', express.static('./public'));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	app.set('json spaces', 4);
	res.set("Content-Type", "application/json");
	next();
});

// app.all('*', function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

// app.use(express.bodyParser());
// app.use( bodyParser.json() );       // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// }));

app.post('/addNewParking/', function(req, res) {
	var _publisherId = req.body.publisherId;
	var _time = req.body.time;
	var _street = req.body.location.street;
	var _number = req.body.location.number;
	var _country = req.body.location.country;
	var _city = req.body.location.city;
	var _lat = req.body.location.lat;
	var _lng = req.body.location.lng;
	var _description = req.body.description;
	var _img = req.body.img;
	var _size = req.body.size;
	var _handicapped = req.body.handicapped;
	var _status = req.body.status;



	parkingsApi.addParking(_publisherId, _time, _street, _number, _city, _country, _lat, _lng, _img, _description, _handicapped, _size, _status, res)
	console.log("finish rout");
});

app.post('/searchParking/', function(req, res) {
	console.log("in search >> " + req.body);
	var _time = req.body.time;
	var _searcherId = req.body.searcherId;

	var _distance = req.body.distance;
	console.log("distance is :::::::::::::::::::: " + _distance)
	console.log(_distance);
	_distance = _distance.trim();
	_distance = parseFloat(_distance.split(" ")[0]);

	console.log("distance is after split: " + _distance)
	console.log(_distance);

	var _street = req.body.location.street;
	var _number = req.body.location.number;
	var _country = req.body.location.country;
	var _city = req.body.location.city;
	var _lat = req.body.location.lat;
	var _lng = req.body.location.lng;
	var _location = {
		street: _street,
		number: _number,
		city: _city,
		country: _country,
		coords: [_lat, _lng]

	};
	if (_distance < 0) {
		_distance = -1 * _distance;
	}

	console.log("in routing distance is : " + _distance);
	parkingsApi.searchParking(_searcherId, _time, _location, _distance, res);
	console.log("finish rout");
});

app.post('/chooseParking/', function(req, res) {

	var searcher_id = req.body.searcherId;
	var parking_id = req.body.parkingId;
	var booking_id = req.body.bookingId;
	parkingsApi.chooseParking(parking_id, searcher_id, booking_id, res);
	console.log("finish rout");

});

app.post('/cancelParking/', function(req, res) {

	var parking_id = req.body.parkingId;
	var booking_id = req.body.bookingId;
	parkingsApi.cancelChooseParking(parking_id, booking_id, res);
	console.log("finish rout");

});

app.post('/deleteParking/', function(req, res) {

	var parking_id = req.body.parkingId;

	parkingsApi.deleteParking(parking_id, res);
	console.log("finish rout");

});

app.post('/deleteBooking/', function(req, res) {

	var booking_id = req.body.bookingId;

	parkingsApi.deleteBooking(booking_id, res);
	console.log("finish rout");

});

app.post('/historyBooking/', function(req, res) {

	var user_id = req.body.userId;

	parkingsApi.historyBooking(user_id, res);
	console.log("finish rout");

});

app.post('/historyParking/', function(req, res) {

	var user_id = req.body.userId;

	parkingsApi.historyParking(user_id, res);
	console.log("finish rout");

});
app.post('/createUser', userMDL.createUser);
app.post('/updateUser', userMDL.updateUser);
app.get('/readUser/:userId', userMDL.readUser);
app.get('/deleteUser/:userId', userMDL.deleteUser);


http.createServer(app).listen(port);
console.log("server is running on port " + port + " ...");
