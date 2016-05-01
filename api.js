var express = require('express');

exports.api = express.Router();



exports.api.route('/date')
.get(function (request, response, next) {

  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
  var date = new Date();
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var currentDate =  day + ' '+ monthNames[monthIndex] +' ' +year;
    // console.log(day, monthNames[monthIndex], year);
    console.log(currentDate);
    response.json(currentDate); //convert to actual json JSON.parse(text)
});

exports.api.route('/time')
.get(function (request, response, next) {

  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ending = " AM";

if (hours > 12) {
    hours -= 12;
    ending = " PM"
} else if (hours === 0) {
   hours = 12;
}

  var currentTime = hours + ":" + minutes + ending;
    console.log(hours,minutes);
    response.json(currentTime); //convert to actual json JSON.parse(text)
});
