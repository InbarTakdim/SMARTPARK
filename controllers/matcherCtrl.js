
'use strict';
var mongoose = require('mongoose');
var Parking = require('../models/parking');
var Location = require('../models/location');
var shortId=require('shortid');
var http = require('http');

class Matcher
{
    constructor(){}

    setChoose(searcherId, idPark)
    {
          console.log(' >> set choose park');
          Parking.update({'$id':idPark}, {'$available':false}, {'$searcher_id':searcherId}, function (err, parkingChoosen){
          if(err) {
            console.log("ERROR >> "+ err);
            throw err;
            }
         });

    }

    checkAndSetScore(userId, tokenUser)
    {

    }

    sendPushNotification(title, message, tokenUser)
    {
      var jwt = 'fb82d74b1f4d9ab4125432d8e6de43b06c96601ee22fe95f';
      var tokens = ['dSklgNesv7Y:APA91bGs12MHaYFzgUwAG1uGgKNH6zY0tSL5VjsTCJKITZ4-VKn_oS52n7y6E84VI0XpeHfdApVcrQ1txG__FgT-M1My0j5yDCh45XUrgKSZI_kZ2-foDOIV_EjtC-uwvWIb1yRYMZXK'];
      var profile = 'tavorc';
      // Build the request object
      var req = {
        method: 'POST',
        url: 'https://api.ionic.io/push/notifications',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        data: {
          "tokens": tokens,
          "profile": profile,
          "notification": {
            "title": title,
            "message": message,
            "android": {
              "title": title,
              "message": message
            },
            "ios": {
              "title": title,
              "message": message
            }
          }
        }
      };
      var callback = function(response) {
        var str = 'ERROR'
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          console.log(str);
        });
      }
      // Make the API call
      var reqs=http.request(req,callback);
      reqs.end();
    }
}

module.exports = Matcher;
