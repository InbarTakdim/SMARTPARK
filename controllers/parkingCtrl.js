'use strict';
var mongoose = require('mongoose');
var Parking = require('../models/parking');
var Booking = require('../models/booking');
var Location = require('../models/location');
var shortId = require('shortid');
var _ = require('lodash');
var dateFormat = /(19|20)\d\d-([1-9]|1[012])-(0[1-9]|[1-9]|1[0-9]|2[0-9]|3[01]) (0[1-9]|[0-9]|[1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

class Parkings {
	constructor() {}

	validation(lat, lng, _time) {

		var isValid = _time.match(dateFormat);
		console.log(" is valid >> " + isValid);
		if (isValid == null) {
			console.log("date validation error !!!");
			return false;
		}

		if (lat > 85 || lat < -85 || lng > 180 || lng < -180) {
			throw ("point is not in valid range !!!");
			return false;
		}
		return true;
	}

	addParking(_publisherId, _time, _street, _number, _city, _country, lat, lng, _img, _description, _handicapped, _size, _status, res) {
		console.log(' >> addParking : ' + _time);
		// _time='2017-02-12 12:50:00'
		// console.log("after chenge "+ _time);
		// _time validation :
		var checkValidation = this.validation(lat, lng, _time);
		if (!checkValidation) {
			console.log("validation error!!!!!!!!!!!!!");
			return false;
		}
		var tmpDate = new Date(_time);
		console.log("after date constrctur " + tmpDate);
		var newParking = new Parking({
			id: shortId.generate(),
			time: tmpDate,
			status: _status,
			occupied: false, // no one want this yet
			location: {
				street: _street,
				number: _number,
				city: _city,
				country: _country,
				coords: [lat, lng]
			},
			handicapped: _handicapped,
			description: _description,
			img: _img,
			size: _size,
			publisherId: _publisherId
		});

		newParking.save(function(err, parking) {
			if (err) {
				console.log(" >>ERROR : " + err);
				handleError(res, err);
			}
			console.log(" new parking add >> " + +newParking.time);
			res.json(newParking);
		});
	}

	searchParking(_searcherId, _time, _location, _distance, res) {
		console.log(' >> searchParking : ' + _time);
		// _time validation :
		var before = new Date(_time);
		var after = new Date(_time);
		before.setMinutes(before.getMinutes() - 15);
		after.setMinutes(after.getMinutes() + 15);
		var _country = _location.country;
		var _city = _location.city;
		var _number = parseInt(_location.number);
		var _street = _location.street;
		var _lat = parseFloat(_location.coords[0]);
		var _lng = parseFloat(_location.coords[1]);
		_distance = parseFloat(_distance);

		var checkValidation = this.validation(_lat, _lng, _time);
		if (!checkValidation) {
			console.log("validation error!!!!!!!!!!!!!");
			return false;
		}
		//save booking:
		var tmpDate = new Date(_time);
		var newBooking = new Booking({
			id: shortId.generate(),
			time: tmpDate,
			distance: _distance,
			location: {
				street: _street,
				number: _number,
				city: _city,
				country: _country,
				coords: [_lat, _lng]
			},
			searcherId: _searcherId,
			parkingId: null //null
		});

		newBooking.save(function(err, parking) {
			if (err) {
				console.log(" >>ERROR in save booking: " + err);
				handleError(res, err);
			}
			console.log(" new booking added >> " + newBooking.time);
		});
		//search:
		_distance = _distance / 6371; //convert km to radians
		// console.log(" After convert km to radians distance is : "+ _distance );
		Parking.find({
			$and: [{
					'location.coords': {
						$geoWithin: {
							$centerSphere: [
								[_lat, _lng], _distance
							]
						}
					}
				}, {
					'time': {
						'$lt': +after,
						'$gte': +before
					}
				},
				{
					'occupied': false
				}
			]
		}, function(err, optionalParkings) {
			if (err) {
				console.log("ERROR in find>> " + err);
				throw err;
			}
			var optionalParkings = JSON.parse(JSON.stringify(optionalParkings));
			for (var i = 0; i < optionalParkings.length; i++)
				optionalParkings[i].time = new Date(optionalParkings[i].time).toLocaleString();
			var jsonRes = {
				bookingId: newBooking.id,
				results: optionalParkings
			};
			console.log("in search res is :" + jsonRes.results.length);
			console.log(jsonRes.results[0]);
			res.send(jsonRes);
		});
	}

	chooseParking(parkingId, searcherId, bookingId, res) {
		Parking.update({
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
				console.log("parking updatede!");
				Booking.update({
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


	cancelChooseParking(parkingId, bookingId, res) {
		Parking.update({
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
				Booking.update({
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

	deleteBooking(bookingId, res) {
		Booking.findOneAndRemove({
			'id': bookingId
		}, function(err) {
			if (err) {
				console.log("error in delete!");
				res.send('error in delete');
			}
			res.send("ssuccess in delete");
		});
	}

	deleteParking(parkingId, res) {
		Parking.findOneAndRemove({
			'id': parkingId
		}, function(err) {
			if (err) {
				console.log("error in delete!");
				res.send('error in delete');
			}
			res.send("ssuccess in delete");
		});
	}

	historyBooking(userId, res) {
		Booking.find({
			'searcherId': userId
		}).sort('-time').exec(function(err, docs) {
			if (err) res.send("error");
			else res.send(docs)
		});

	}

	historyParking(userId, res) {
		Parking.find({
			'publisherId': userId
		}).sort('-time').exec(function(err, docs) {
			if (err) res.send("error");
			else res.send(docs)
		});

	}






}

module.exports = Parkings;
