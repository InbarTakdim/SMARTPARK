'use strict';
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Location = new Schema({
    street: String,
    number: String,
    city: String,
    lat: Number,
    lng: Number
});

module.exports = Location;