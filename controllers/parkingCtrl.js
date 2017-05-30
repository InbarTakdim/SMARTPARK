'use strict';
var mongoose 	= require('mongoose'),
 	Parking 	= require('../models/parking'),
	Booking 	= require('../models/booking'),
	Location 	= require('../models/location'),
	shortId 	= require('shortid'),
	_ 			= require('lodash'),
	dateFormat 	= /(19|20)\d\d-([1-9]|1[012])-(0[1-9]|[1-9]|1[0-9]|2[0-9]|3[01]) (0[1-9]|[0-9]|[1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

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
	addParking(req, res) {
		let publisherId 	= req.body.publisherId,
			time 			= req.body.time,
			street 			= req.body.location.street,
			number 			= req.body.location.number,
			country 		= req.body.location.country,
			city 			= req.body.location.city,
			lat 			= req.body.location.lat,
			lng 			= req.body.location.lng,
			description 	= req.body.description,
			img				= req.body.img,
			size 			= req.body.size,
			handicapped 	= req.body.handicapped,
			status 			= req.body.status;

		console.log(`>> addParking : ${time}`);
		let checkValidation = this.validation(lat, lng, time);
		if (!checkValidation) {
			console.log("validation error!");
			return false;
		}
		let tmpDate = new Date(time);
		console.log(`after Date constructor ${tmpDate}`);
		let newParking = {
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

		Parking.save({newParking}, (err, parking) => {
			if (err) throw err ;
			res.json(newParking);
		});
	}

	searchParking(req, res) {
		let time 		= req.body.time,
			searcherId 	= req.body.searcherId,
			distance 	= req.body.distance,
			street 		= req.body.location.street,
			number 		= req.body.location.number,
			country 	= req.body.location.country,
			city 		= req.body.location.city,
			lat 		= req.body.location.lat,
			lng 		= req.body.location.lng;

		let location = {
				street: street,
				number: number,
				city: city,
				country: country,
				coords: [parseFloat(lat), parseFloat(lat)]
			};

		console.log(`>>in search ${req.body}`);
		console.log(`>>distance is: ${distance}`)
		distance 	= distance.trim();
		distance 	= parseFloat(distance.split(" ")[0]);
		console.log(`>>distance after split: ${distance}`)

		if (distance < 0)
			distance = Math.abs(distance);

		console.log(`>>searchParking: ${time}`);
		// _time validation :
		let before 	= new Date(time),
			after 	= new Date(time);

		before.setMinutes(before.getMinutes() - 15);
		after.setMinutes(after.getMinutes() + 15);
		distance = parseFloat(distance);

		let checkValidation = this.validation(lat, lng, time);
		if (!checkValidation) {
			console.log(">>validation error!");
			return false;
		}
		//save booking:
		let	newBooking = {
				id: shortId.generate(),
				time: new Date(time),
				distance: distance,
				location: location,
				searcherId: searcherId,
				parkingId: null //null
		};

		Booking.save((err, parking) => {
			if (err) throw err;
			console.log(" new booking added >> " + newBooking.time);
		});

		//search:
		distance = distance / 6371; //convert km to radians
		// console.log(" After convert km to radians distance is : "+ _distance );
		Parking.find({
			$and: [{
					'location.coords': {
						$geoWithin: {
							$centerSphere: [
								[lat, lng], distance
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
			if (err) throw err;
			optionalParkings = JSON.parse(JSON.stringify(optionalParkings));
			for (i = 0; i < optionalParkings.length; i++)
				optionalParkings[i].time = new Date(optionalParkings[i].time).toLocaleString();
			let jsonRes = {
				bookingId: newBooking.id,
				results: optionalParkings
			};
			console.log(`in search res is: ${jsonRes.results.length}`);
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
				var ans={
				name:"error"
				}
				res.json(ans);

			}
			var ans={
				name:"success"
			}
			res.json(ans);
		});
	}

	deleteParking(parkingId, res) {
		Parking.findOneAndRemove({
			'id': parkingId
		}, function(err) {
			if (err) {
				console.log("error in delete!");
				var ans={
				name:"error"
				}
				res.json(ans);
			}
		var ans={
				name:"success"
			}
			res.json(ans);

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
