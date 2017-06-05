'use strict';
var mongoose 	= require('mongoose'),
	parking 	= require('../models/parking'),
	booking 	= require('../models/booking'),
	userCtrl 	= require('./userCtrl'),
	shortId 	= require('shortid'),
	_ 			= require('lodash'),
	d3 			= require('d3');
// dateFormat 	= /(19|20)\d\d-([1-9]|1[012])-(0[1-9]|[1-9]|1[0-9]|2[0-9]|3[01]) (0[1-9]|[0-9]|[1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
// location 	= require('../models/location');

var formatDay 	= d3.timeFormat("%Y-%m-%d"),
	formatTime 	= d3.timeFormat("%H:%M"),
	formatDate 	= d3.timeFormat("%Y-%m-%d %H:%M:00");

var toLocalDate = (date) => {
	var day 			= formatDay(new Date(date.d)),
		time 			= formatTime(new Date(date.t)),
	 	formatedDate 	= formatDate(new Date(`${day} ${time}`));

	console.log(`day: ${day}`);
	console.log(`time: ${time}`);
	console.log(`formated: ${formatedDate}`);

	return formatedDate;
};

var validation = (lat, lng, time) => {
	// var isValid = time.match(dateFormat); // NOTE: no needed anymore...
	// console.log(`is valid >> ${isValid}`);
	// if (!isValid) {
	// 	console.log('Date validation error !!!');
	// 	return false;
	// }

	if (lat > 85 || lat < -85 || lng > 180 || lng < -180) {
		console.log("point is not in valid range !!!");
		return false;
	}
	return true;
}

exports.addParking = (req, res) => {
	var publisherId 	= req.body.publisherId,
		time 			= toLocalDate(req.body.time),
		lat 			= req.body.location.lat,
		lng 			= req.body.location.lng,
		description 	= req.body.description,
		img 			= req.body.img,
		size 			= req.body.size,
		handicapped 	= req.body.handicapped,
		status 			= req.body.status;

	console.log(`>> addParking : ${time}`);
	// console.log(this.validation(lat, lng, time));
	var checkValidation = validation(lat, lng, time);
	if (!checkValidation) {
		console.log("validation error!");
		return false;
	}

	var tmpDate = new Date(time);
	console.log(`after Date constructor ${tmpDate}`);
	var newParking = {
		id: shortId.generate(),
		time: tmpDate,
		status: status,
		occupied: false, // no one want this yet
		location: {
			street: street,
			number: number,
			city: city,
			country: country,
			coords: [lat, lng]
		},
		handicapped: handicapped,
		description: description,
		img: img,
		size: size,
		publisherId: publisherId
	};

	parking.collection.save({
		newParking
	}, (err, parking) => {
		if (err) return err;
		res.json(newParking);
	});
}

exports.searchParking = (req, res) => {
	var time 		= toLocalDate(req.body.time),
		searcherId 	= req.body.searcherId,
		distance 	= req.body.distance,
		street 		= req.body.location.street,
		number 		= req.body.location.number,
		country 	= req.body.location.country,
		city 		= req.body.location.city,
		lat 		= req.body.location.lat,
		lng 		= req.body.location.lng;

	var location = {
		street: street,
		number: number,
		city: city,
		country: country,
		coords: [parseFloat(lat), parseFloat(lat)]
	};
	// time :
	console.log(`>>time is: ${time}`);
	console.log(`>>distance is: ${distance}`);
	distance = distance.trim();
	distance = parseFloat(distance.split(" ")[0]);

	if (distance < 0)
		distance = Math.abs(distance);

	// _time validation :
	var start 	= d3.timeMinute.offset(new Date(time), -15),
		end	= d3.timeMinute.offset(new Date(time), +15);

	distance = parseFloat(distance);
	var checkValidation = validation(lat, lng, time);
	if (!checkValidation) {
		console.log(">>validation error!");
		return false;
	}

	//save booking:
	var newBooking = {
		id: shortId.generate(),
		time: new Date(time),
		distance: distance,
		location: location,
		searcherId: searcherId,
		parkingId: null //null
	};

	booking.collection.save(newBooking, (err, writeResult) => {
		if (err) throw err; //NOTE: writeResult.writeError
		console.log(`New booking added >> ${writeResult}`);
	});

	distance = distance / 6371; //convert km to radians

	parking.find({
			$and: [
				{
					'location.coords': {
						$geoWithin: {
							$centerSphere: [[lat, lng], distance]
						}
					}
				}
				,
				{
					'time': {'$gte': new Date(start+'Z'), '$lt': new Date(end+'Z')}//(new Date(start+'Z'), '$gte': (new Date(end+'Z')
				}
				,
				{
					'occupied': false
				}
			]
		},
		function(err, optionalParkings) {
			if (err) return err;
			optionalParkings = JSON.parse(JSON.stringify(optionalParkings));
			if(optionalParkings.length)
				userCtrl.decPoint(searcherId, 1); //NOTE: points by default equals 1

			for (var i = 0; i < optionalParkings.length; i++)
				optionalParkings[i].time = new Date(optionalParkings[i].time).toLocaleString();
			var jsonRes = {
				bookingId: newBooking.id,
				results: optionalParkings
			};
			console.log(`in search res is: ${jsonRes.results.length}`);
			console.log(jsonRes.results);
			res.send(jsonRes);
		});
}

exports.chooseParking = (req, res) => {
	var searcherId = req.body.searcherId,
		parkingId = req.body.parkingId,
		bookingId = req.body.bookingId;

	parking.collection.update({
			'id': parkingId
		}, {
			$set: {
				'occupied': true
			}
		}, {
			multi: false
		},
		function(err, parks) {
			if (err) {
				console.log("error in parking update~~");
				res.send("error");
			}
			console.log("parking updated!");
			booking.collection.update({
					'id': bookingId
				}, {
					$set: {
						'searcherId': searcherId,
						'parkingId': parkingId
					}
				}, {
					multi: false
				},
				function(err, books) {
					if (err) {
						console.log("error in booking update~~");
						res.send("error");
					}

					var jsonRes = {
						booking: books,
						parking: parks
					};
					res.send(jsonRes);
				}
			);
		}
	);
}


exports.cancelParking = (req, res) => {
	varparkingId = req.body.parkingId,
		bookingId = req.body.bookingId;
	parking.collection.update({
			'id': parkingId
		}, {
			$set: {
				'occupied': false
			}
		}, {
			multi: false
		},
		function(err, parks) {
			if (err) {
				console.log("error in parking update~~");
				res.send("error");
			}
			console.log("parking updatede!");
			booking.collection.update({
					'id': bookingId
				}, {
					$set: {
						'searcherId': null,
						'parkingId': null
					}
				}, {
					multi: false
				},
				function(err, books) {
					if (err) {
						console.log("error in booking update~~");
						res.send("error");
					}
					var jsonRes = {
						booking: books,
						parking: parks
					};

					res.send(jsonRes);
				}
			);
		}
	);
}

exports.deleteParking = (req, res) => {
	var parkingId = req.body.parkingId;
	parking.collection.findOneAndRemove({
		'id': parkingId
	}, function(err) {
		if (err) {
			console.log("error in delete!");
			var ans = {
				name: "error"
			}
			res.json(ans);
		}
		var ans = {
			name: "success"
		}
		res.json(ans);

	});
}

exports.deleteBooking = (req, res) => {
	var bookingId = req.body.bookingId;
	booking.collection.findOneAndRemove({
		'id': bookingId
	}, function(err) {
		if (err) {
			console.log("error in delete!");
			var ans = {
				name: "error"
			}
			res.json(ans);

		}
		var ans = {
			name: "success"
		}
		res.json(ans);
	});
}

exports.historyBooking = (req, res) => {
	var userId = req.body.userId;
	booking.find({
		'searcherId': userId
	}).sort('-time').exec(function(err, docs) {
		if (err) res.send("error");
		else res.send(docs)
	});

}

exports.historyParking = (req, res) => {
	var userId = req.body.userId;
	parking.find({
		'publisherId': userId
	}).sort('-time').exec(function(err, docs) {
		if (err) res.send("error");
		else res.send(docs)
	});

}
