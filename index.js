'use strict';
var ParkingsController = require('./controllers/parkingCtrl.js');
var parkingsApi = new ParkingsController();
var port = process.env.PORT ||8080;
var express=require('express');
var bodyParser=require('body-parser');
var app=express();
var http= require('http');

app.use(express.bodyParser());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
})); 


app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/addNewParking/'
    , function(req,res){
    var _publisherId = req.body.publisherId ;
    var _time = req.body.time;
    var _street = req.body.street;
    var _number = req.body.number;
    var _country = req.body.country;
    var _city = req.body.city;
    var _lat = req.body.lat;
    var _lng = req.body.lng;
    var _description = req.body.description;
    var _img = req.body.img;
    var _size = req.body.size;
    var _handicapped = req.body.handicapped;
    var _status = req.body.status;



    parkingsApi.addParking(_publisherId , _time, _street, _number, _city,_country, _lat, _lng, _img, _description, _handicapped, _size, _status,res)
    console.log("finish rout");
});

app.post('/searchParking/'
    , function(req,res){
    var _time = req.body.time;
    var _searcherId=req.body.searcherId;
    var _distance = req.body.distance;
    //var _street = req.body.street;
    //var _number = req.body.number;
    //var _country = req.body.country;
   // //var _city = req.body.city;
    //var _lat = req.body.lat;
    //var _lng = req.body.lng;
    var _location=req.body.location;
    /*var _location={
         street: _street,
         number: _number,
         city: _city,
         country: _country,
         coords: [_lat,_lng]

    };*/

    if(_distance < 0 )
    {
      _distance = -1*_distance;
    }
    
    parkingsApi.searchParking(_searcherId, _time, _location, _distance, res);
    console.log("finish rout");

});

// app.get('/setParking/:parking_id/:searcher_id'
//     , function(req,res){
//     var reporterId = req.params.reporter_id;
//     var time = req.params.time;
//     var street = req.params.street;
//     var number = req.params.number;
//     var city = req.params.city;
//     var img = req.params.img;
//     var lat = req.params.lat;
//     var lng = req.params.lng;
//     var description = req.params.description;
//     parkingsApi.addParking(reporterId, time, street,
//     number, city, lat, lng, img, description , res);
//     console.log("finish rout");

// });

http.createServer(app).listen(port);
console.log("server is running on port " + port + " ...");



