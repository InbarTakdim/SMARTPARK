'use strict';
var parkingCtrl	= require('./controllers/parkingCtrl.js'),
	userCtrl  		= require('./controllers/userCtrl.js'),
	db  			= require('./dbconf'),
	express  		= require('express'),
	bodyParser  	= require('body-parser'),
	http  			= require('http'),
	_ 	 			= require('lodash'), //NOTE: might not required.
	parkingsApi 	= new parkingCtrl(),
	port 			= process.env.PORT || 8080,
	app 			= express();


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

/**NOTE: Example of 2 functions that has been migrated to MVC model**/
app.post('/addNewParking', parkingsApi.addParking);
app.post('/searchParking', parkingsApi.searchParking);
/**End of Example **/

app.post('/chooseParking', function(req, res) {

	var searcher_id = req.body.searcherId;
	var parking_id = req.body.parkingId;
	var booking_id = req.body.bookingId;
	parkingsApi.chooseParking(parking_id, searcher_id, booking_id, res);
	console.log("finish rout");

});

app.post('/cancelParking', function(req, res) {

	var parking_id = req.body.parkingId;
	var booking_id = req.body.bookingId;
	parkingsApi.cancelChooseParking(parking_id, booking_id, res);
	console.log("finish rout");

});

app.post('/deleteParking', function(req, res) {

	var parking_id = req.body.parkingId;

	parkingsApi.deleteParking(parking_id, res);
	console.log("finish rout");

});

app.post('/deleteBooking', function(req, res) {

	var booking_id = req.body.bookingId;

	parkingsApi.deleteBooking(booking_id, res);
	console.log("finish rout");

});

app.post('/historyBooking', function(req, res) {

	var user_id = req.body.userId;

	parkingsApi.historyBooking(user_id, res);
	console.log("finish rout");

});

app.post('/historyParking', function(req, res) {

	var user_id = req.body.userId;

	parkingsApi.historyParking(user_id, res);
	console.log("finish rout");

});

/**user Module routs **/
app.post('/createUser', userCtrl.createUser);
app.post('/updateUser', userCtrl.updateUser);
app.post('/readUser', userCtrl.readUser);
app.post('/deleteUser', userCtrl.deleteUser);
app.get('/getAll', userCtrl.getAll); //NOTE: just for testing DB

http.createServer(app).listen(port);
console.log(`server is running on port ${port}...`);
