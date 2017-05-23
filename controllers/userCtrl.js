//DB schema:
var data = require('../models/user');

//Module functions:
exports.createUser = (req, res) => {
	data.updateOne({email: req.body.email}, req.body, {upsert: true},
		(err, obj) => {
			console.log(req.body.name);
			if (err) throw err;
			if (!obj) res.send(false);
			console.log(`${req.body.name} has been inserted!`);
			res.json(obj);
		});
};
exports.readUser = (req, res) => {
	data.findOne({email: req.params.userId}, {}, (err, obj) => {
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
	data.updateOne({email: req.params.userId}, {userInfo}, {upsert: true}, (err, obj) => {
		if (err) throw err;
		console.log(`userId ${req.params.userId} has been updated!`);
		res.json(obj);
	});
};
exports.deleteUser = (req, res) => {
	data.deleteOne({email: req.params.userId}, (err, obj) => {
		if (err) throw err;
		console.log(`${obj} has been deleted!`);
		res.json(obj);
	});
};
