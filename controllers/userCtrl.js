'use strict';
//DB schema:
var user = require('../models/user'),
	booking = require('../models/booking'),
	request = require('request'),
	parking = require('../models/parking');

//Module functions: //NOTE: needed to be change to db.collection.findAndModify()
exports.createUser = (req, res) => {
	console.log(req.body.email);
	user.find({email: req.body.email}, (err, item) => {
		console.log(item);

		if (item && item != '') {
			console.log(`user ${req.body.email} already exist!`);
			res.send(false)
		} else {
			user.updateOne({
					email: req.body.email
				}, req.body, {
					upsert: true
				},
				(err, obj) => {
					console.log(obj);
					if (err) throw err;
					if (!obj) res.send(false);
					console.log(`${req.body.name} has been inserted!`);
					res.json(obj);
				});
		}
	})

};
exports.readUser = (req, res) => {
	console.log(req.params.userId);
	console.log(req.params.userPass);
	user.findOne({
		email: req.params.userId,
		password: req.params.userPass
	}, (err, obj) => {
		console.log(obj);
		if (err) throw err;
		if (obj == null) {
			console.log(`${req.params.userId} not found!`);
			res.json(false)
		}
		else{
			console.log(`${obj} has been found!`);
			res.json(obj);
		}
	});
};

exports.updateUser = (req, res) => {
	let userInfo = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		carId: req.body.carId
	}
	user.collection.update({
		email: req.body.email
	}, {
		userInfo
	}, {
		upsert: true
	}, (err, obj) => {
		if (err) throw err;
		console.log(`userId ${req.body.email} has been updated!`);
		res.json(obj);
	});
};
exports.deleteUser = (req, res) => {
	user.deleteOne({
		email: req.body.email
	}, (err, obj) => {
		if (err) throw err;
		console.log(`${obj} has been deleted!`);
		res.json(obj);
	});
};
exports.updatePoints = (userId, points, callback) => {
	user.collection.update({
		email: userId
	}, {
		$inc: {
			smarties: points
		}
	}, {
		upsert: true
	}, (err, obj) => {
		if (err) callback(err) ;
		console.log(`userId:  ${userId} gain/lost #${points} points!`);
		// console.log(obj);
		callback(obj);
	});
}
exports.incPoints = (req, res) => {
	let userId = req.params.userId,
		points = req.params.points;
	user.collection.update({
		email: userId
	}, {
		$inc: {
			smarties: points
		}
	}, {
		upsert: true
	}, (err, obj) => {
		if (err) return err;
		console.log(`userId:  ${userId} gain/lost #${points} points!`);
		// console.log(obj);
		res.json(obj);
	});
	// res.json(this.updatePoints(req.params.userId, req.params.points));
}

// const Service = {
//   foo: (a, b) => a + b,
//   bar: (a, b) => Service.foo(a, b) * b
// }
//
// module.exports = Service

// NOTE: just for testing DB
exports.getAll = (req, res) => {
	user.find({}, (err, obj) => {
		if (err) throw err;
		console.log(`printing all DB`);
		res.json(obj);
	});
};
