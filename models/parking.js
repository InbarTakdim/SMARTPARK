'use strict';
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
mongoose.Promise = global.Promise;

var connection = mongoose.connect('mongodb://db_usr:db_pass@ds011321.mlab.com:11321/parkings')
var parkingSchema = new Schema({
    id:{type: String , required: true , unique: true},
    reporter_id:{type: Number },
    searcher_id:{type: Number},
    available:{type:Boolean},
    time:{type:Date},
    location:{
        street: {type: String},
        number: {type:Number},
        city: {type:String},
        coord: {type:[Number] , index: '2d'} 
    },
    handicapped:{type:Boolean},
    img: {type: String},
    repeat: {type:String},
    size: {type:Number},
    disabled_vehicle: {type:Boolean},
    description:{type: String}
}, {collection : 'parkings'});

module.exports = connection.model('parking', parkingSchema);