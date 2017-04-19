'use strict';
var ParkingsController = require('./controllers/parkingCtrl.js');
var parkingsApi = new ParkingsController();
var port = process.env.PORT ||8080;
var express=require('express');
var app=express();
var http= require('http');

/*
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
*/

app.get('/addNewParking/:reporter_id/:time/:street/:number/:city/:lat/:lng/:img/:description'
    , function(req,res){
    var reporterId = req.params.reporter_id;
    var time = req.params.time;
    var street = req.params.street;
    var number = req.params.number;
    var city = req.params.city;
    var img = req.params.img;
    var lat = req.params.lat;
    var lng = req.params.lng;
    var description = req.params.description;
    parkingsApi.addParking(reporterId, time, street,
    number, city, lat, lng, img, description , res);
    console.log("finish rout");

});

app.get('/searchParking/:time/:lat/:lng/:diff'
    , function(req,res){
    var time = req.params.time;
    var lat = req.params.lat;
    var lng = req.params.lng;
    var diff = req.params.diff;
    if(diff < 0 )
    {
      diff = -1*diff;
    }
    parkingsApi.searchParking( time, lat, lng, diff, res);
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



