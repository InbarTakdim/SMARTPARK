'use strict';
//DB schema:
var user = require('../models/user'),
	booking = require('../models/booking'),
	parking = require('../models/parking');

//Module functions:
exports.createUser = (req, res) => {
	user.updateOne({
			email: req.body.email
		}, req.body, {
			upsert: true
		},
		(err, obj) => {
			console.log(req.body.name);
			if (err) throw err;
			if (!obj) res.send(false);
			console.log(`${req.body.name} has been inserted!`);
			res.json(obj);
		});
};
exports.readUser = (req, res) => {
	user.findOne({
		email: req.body.email
	}, {}, (err, obj) => {
		if (err) throw err;
		console.log(`${obj} has been found!`);
		res.json(obj);
	});
};
exports.updateUser = (req, res) => {
	let userInfo = {
		name: req.body.name,
		email: req.body.email,
		// password: req.body.password,
		carId: req.body.carId
	}
	user.updateOne({
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
// NOTE: just for testing DB
exports.getAll = (req, res) => {
	user.find({}, (err, obj) => {
		if (err) throw err;
		console.log(`printing all DB`);
		res.json(obj);
	});
};
