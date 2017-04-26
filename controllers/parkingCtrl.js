'use strict';
var mongoose = require('mongoose');
var Parking = require('../models/parking');
var Location = require('../models/location');
var shortId=require('shortid');
var dateFormat = /(19|20)\d\d-(0[1-9]|1[012])-([012]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

class Parkings
{
    constructor(){}

    addParking(_reporterId , _time, _street, _number, _city, lat, lng, _img, _description, res)
    {   console.log(' >> addParking');
        // _time validation :
        
        var isValid = _time.match(dateFormat);
        console.log(" is valid >> "+ isValid);
        if(isValid == null) {
          console.log("validation error !!!");
          //res.setHeader('Content-Type', 'application/json');
          res.send("validtion error") ;
          return false;
        }

        if(lat > 85 || lat< -85 || lng>180 || lng<-180) 
        {
          throw("point is not in valid range !!!");
          return false;
        }
        
        var tmpDate = new Date(_time);
        //console.log(" before adding the time >> "+ tmpDate);
        var newParking = new Parking({
          id: shortId.generate(),
          reporter_id: _reporterId,
          searcher_id: null, // no one search it yet
          available: true, // no one want this yet
          time: tmpDate, 
          location:{
            street: _street,
            number: _number,
            city: _city,
            coord: [lat,lng]
          },
          handicapped: false,
          img: _img,
          description: _description
          });
          newParking.save(function(err,parking){
            if(err){
              console.log(" >>ERROR : " +err);
              throw err;
            }
          console.log(" new parking add >> " + +newParking.time);
          //res.setHeader('Content-Type', 'text/javascript');
          res.send("sucess " + newParking);
         });    
    }

     searchParking( _time, lat, lng, diff, res){

       var before = new Date(_time);
       var after= new Date(_time);
       before.setMinutes(before.getMinutes() - 15);
       after.setMinutes(after.getMinutes() + 15);
       //console.log('before: ' + before + ', after: ' + after);

       //save booking:










       //search:
       Parking.find({ $and: [
        {'location.coord': {
       '$near': [lat , lng], '$maxDistance':diff} } , {'time': {
       '$lt': +after , '$gte':+before} } , {'available':true} ]}, function (err, optionalParkings){
          if(err) {
            console.log("ERROR >> "+ err);
            throw err;
          }
          //console.log('1: ' + typeof optionalParkings);
          var optionalParkings =JSON.parse(JSON.stringify(optionalParkings));
         // console.log('2: ' + typeof optionalParkings);
          for(var i=0; i<optionalParkings.length; i++)
              optionalParkings[i].time = new Date(optionalParkings[i].time).toLocaleString();
            //console.log(" >>> " + new Date(optionalParkings[i].time));
          //res.setHeader('Content-Type', 'application/json');
          res.send(optionalParkings);
        }); 
     }
}

module.exports = Parkings;