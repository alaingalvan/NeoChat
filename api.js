var express = require('express');

exports.api = express.Router();



exports.api.route('/all')
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
    response.json(currentDate); //convert to actual json
});
