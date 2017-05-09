'use strict';
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
mongoose.Promise = global.Promise;

//var connection = mongoose.connect('mongodb://db_usr:db_pass@ds011321.mlab.com:11321/parkings')
var connection = mongoose.createConnection('mongodb://db_usr:db_pass@ds129030.mlab.com:29030/parkings');
                                    
var parkingSchema = new Schema({
    id:{type: String , required: true , unique: true},
    time:{type:Date},
    status: {type:String},
    occupied:{type: Boolean},
    location:{
        street: {type: String},
        number: {type:Number},
        city: {type:String},
        country: {type:String},
        coords: {type:[Number] , index: '2d'} 
    },
    handicapped:{type:Boolean},
    description:{type: String},
    img: {type: String},
    size: {type:String , enum:['Length parking', 'small', 'medium', 'large']},
    publisherId:{type: String}
}, {collection : 'parkings'});

module.exports = connection.model('parking', parkingSchema);