'use strict';
var mongoose = require('mongoose'),
    parking = require('../models/parking'),
    booking = require('../models/booking'),
    userCtrl = require('./userCtrl'),
    shortId = require('shortid'),
    // _ = require('lodash'),
    d3 = require('d3');

var validation = (lat, lng) => {
    if (lat > 85 || lat < -85 || lng > 180 || lng < -180) {
        console.log("point is not in valid range !!!");
        return false;
    }
    return true;
}

exports.addNewParking = (req, res) => {
    console.log(`Function: addNewParking start!`);
    console.log(`Oiginal Time is: ${req.body.time}`);
    var publisherId = req.body.publisherId,
        publisherToken = req.body.publisherToken,
        time = req.body.time,
        location = req.body.location,
        lat = req.body.location.lat,
        lng = req.body.location.lng,
        description = req.body.description,
        img = req.body.img,
        size = req.body.size,
        handicapped = req.body.handicapped,
        currentCar = req.body.currentCar;

    console.log(`
        ${publisherId}
        ${publisherToken}
        ${time}
        ${location}
        ${lat}
        ${lng}
        ${description}
        ${img}
        ${size}
        ${handicapped}
        ${req.body}
    `);
    location.coords = [parseFloat(lat), parseFloat(lng)];

    console.log(`>> addParking : ${time}`);
    var checkValidation = validation(lat, lng);
    if (!checkValidation) {
        console.log("validation error!");
        return false;
    }

    var newParking = {
        id: shortId.generate(),
        postedOn: new Date(), //NOTE: for user's history
        time: new Date(time),
        occupied: false,
        location: location,
        handicapped: handicapped,
        description: description,
        img: img,
        size: size,
        publisherId: publisherId,
        publisherToken: publisherToken,
        currentCar: currentCar
    };

    parking.collection.save(newParking, (err, writeResult) => {
        if (err) throw err; //NOTE: writeResult.writeError
        console.log(`New booking added >> ${writeResult}`);
        res.json(newParking)
    });
}

exports.searchParking = (req, res) => {
    console.log(`Function: searchParking start!`);
    var time = req.body.time,
        searcherId = req.body.searcherId,
        distance = req.body.distance,
        location = req.body.location,
        lat = req.body.location.lat,
        lng = req.body.location.lng,
    	size = req.body.size;


    location.coords = [parseFloat(lat), parseFloat(lng)];
    console.log(location.coords);
    console.log(`>>time is: ${time}`);
	console.log(`>>size is: ${size}`);
    console.log(`>>distance is: ${distance}`);
    distance = distance.trim();
    distance = parseFloat(distance.split(" ")[0]);

    if (distance < 0)
        distance = Math.abs(distance);

    var start = d3.timeMinute.offset(new Date(time), -15),
        end = d3.timeMinute.offset(new Date(time), +15);

    distance = parseFloat(distance);
    var checkValidation = validation(lat, lng);
    if (!checkValidation) {
        console.log(">>validation error!");
        return false;
    }

    //save booking:
    var newBooking = {
        id: shortId.generate(),
        postedOn: new Date(),
        time: new Date(time),
        distance: distance,
        location: location,
        searcherId: searcherId,
		size: size,
        parkingId: null //null
    };

    booking.collection.save(newBooking, (err, writeResult) => {
        if (err) throw err; //NOTE: writeResult.writeError
    });

    distance = distance / 6371; //convert km to radians
	console.log(`${start} , ${end}`);
    parking.find({
        $and: [
			{
                'location.coords': {
                    $geoWithin: {
                        $centerSphere: [
                            [lat, lng], distance
                        ]
                    }
                }
            },
            {
                'time': {
                    '$gte': +start,
                    '$lt': +end
                }
            },
            {
                'occupied': false
            }
			,{
                'size':{
                    '$gte': size
                }
            }
        ]
    },
    function(err, optionalParkings) {
        if (err) return err;
        optionalParkings = JSON.parse(JSON.stringify(optionalParkings));
        if (optionalParkings.length)
            userCtrl.updatePoints(searcherId, -1, answer => {console.log(answer);} ); //NOTE: points by default equals 1 //need to check if user has points

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

exports.setParking = (req, res) => {
    var set     = req.params.set,
    parkingId   = req.params.parkingId;
    parking.findAndModify({
        query: { id: parkingId },
        update: { occupied: set },
        upsert: true
    },(err, obj) => {
        if (err) throw err;
        console.log(obj);
        res.send(obj);
    });
}

exports.cancelParking = (req, res) => {
    var parkingId = req.body.parkingId,
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
    parking.findOneAndRemove({
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
    booking.findOneAndRemove({
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
    booking
    .find({'searcherId': userId})
    .sort('-time')
    .exec(function(err, docs) {
        if (err) throw err;
        res.send(docs);
    });

}

exports.historyParking = (req, res) => {
    var userId = req.body.userId;
    parking
    .find({'publisherId': userId})
    .sort('-time')
    .exec(function(err, docs) {
        if (err) throw err;
        res.send(docs);
    });

}
