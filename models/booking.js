'use strict';
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
mongoose.Promise = global.Promise;


var connection1 = mongoose.createConnection('mongodb://db_usr:db_pass@ds131099.mlab.com:31099/bookings1');
var bookingSchema = new Schema({
    id:{type: String , required: true , unique: true},
    time:{type:Date},
    distance:{type: Number},  
    location:{
        street: {type: String},
        number: {type:Number},
        city: {type:String},
        country: {type:String},
        coords: {type:[Number] , index: '2d'} 
    },
    searcherId: {type: String},
    parkingId: {type: String}
}, {collection : 'bookings'});

module.exports = connection1.model('booking', bookingSchema);

