'use strict';
var mongoose = require('mongoose');
var Parking = require('../models/parking');
var Booking = require('../models/booking');
var Location = require('../models/location');
var shortId=require('shortid');
var _ = require('lodash');
// var dateFormat = /(19|20)\d\d-(0[1-9]|1[012])-([012]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

class Parkings
{
    constructor(){}

    validation(lat , lng, _time){

      var isValid = _time.match(dateFormat);
      console.log(" is valid >> "+ isValid);
      if(isValid == null) {
        console.log("date validation error !!!");
        return false;
        }

        if(lat > 85 || lat< -85 || lng>180 || lng<-180) 
        {
          throw("point is not in valid range !!!");
          return false;
        }
        return true;
    }

    addParking(_publisherId , _time, _street, _number, _city,_country, lat, lng, _img, _description, _handicapped, _size, _status,res)
    {   console.log(' >> addParking');
        // _time validation : 
        /*var checkValidation= this.validation(lat, lng, _time);
        if(!checkValidation){
          console.log("validation error!!!!!!!!!!!!!");
          return false;
        }
        */
       
        var tmpDate = new Date(_time);
        var newParking = new Parking({
          id: shortId.generate(),
          time: tmpDate, 
          status: _status,
          occupied: false, // no one want this yet
          location:{
            street: _street,
            number: _number,
            city: _city,
            country: _country,
            coords: [lat,lng]
          },
          handicapped: _handicapped,
          description: _description,
          img: _img,
          size: _size,
          publisherId: _publisherId
          });

        newParking.save(function(err,parking){
          if(err){
            console.log(" >>ERROR : " +err);
            handleError(res, err);
          }
          console.log(" new parking add >> " + +newParking.time);
          res.json(newParking);
         });    
    }

    searchParking(_searcherId, _time, _location, _distance, res)
    {
      // _time.d = (_.split(_time.d, 'T', 2))[0];
      // _time.t = (_.split(_time.t, 'T', 2))[1];
      // _time = _time.d + ' ' + _time.t;




       var before = new Date(_time);
       var after= new Date(_time);
       before.setMinutes(before.getMinutes() - 15);
       after.setMinutes(after.getMinutes() + 15);
       //console.log('before: ' + before + ', after: ' + after);
       var _country= _location.country;
       var _city= _location.city;
       var _number= parseInt(_location.number);
       var _street= _location.street;
       var _lat=parseFloat(_location.coords[0]);
       var _lng= parseFloat(_location.coords[1]);

       // var checkValidation= this.validation(_lat, _lng, _time);
       //  if(!checkValidation){
       //    console.log("validation error!!!!!!!!!!!!!");
       //    return false;
       //  }

       //save booking:
       var tmpDate = new Date(_time);
       var newBooking= new Booking({
          id: shortId.generate(),
          time: tmpDate,
          distance:_distance, 
          location:{
            street: _street,
            number: _number,
            city: _city,
            country: _country,
            coords: [_lat,_lng]
          },
          searcherId: _searcherId, 
          parkingId: null //null
       });

        newBooking.save(function(err,parking){
          if(err){
            console.log(" >>ERROR in save booking: " +err);
            handleError(res, err);
          }
          console.log(" new booking added >> " + newBooking.time);
         });    
         

       //search:
       console.log("-------------------here---------------------------------");
        Parking.find({ $and: [
        {'location.coords': {
       '$near': [_lat ,_lng], '$maxDistance':_distance} } , {'time': {
       '$lt': +after , '$gte':+before} } , {'occupied':false} ]}, function (err, optionalParkings){
          if(err) {
            console.log("ERROR in find>> "+ err);
            throw err;
          }
          //console.log('1: ' + typeof optionalParkings);
          var optionalParkings =JSON.parse(JSON.stringify(optionalParkings));
         // console.log('2: ' + typeof optionalParkings);
          for(var i=0; i<optionalParkings.length; i++)
              optionalParkings[i].time = new Date(optionalParkings[i].time).toLocaleString();
            //console.log(" >>> " + new Date(optionalParkings[i].time));
          //res.setHeader('Content-Type', 'application/json');
          var jsonRes={
            bookingId: newBooking.id,
            results:optionalParkings 
          };
          
          res.send(jsonRes);
        }); 
     }
}

module.exports = Parkings;