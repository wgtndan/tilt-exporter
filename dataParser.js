"use strict";
let colourMap = new Map();
colourMap.set("A495BB10-C5B1-4B44-B512-1370F02D74DE", "Red");
colourMap.set("A495BB20-C5B1-4B44-B512-1370F02D74DE", "Green");
colourMap.set("A495BB30-C5B1-4B44-B512-1370F02D74DE", "Black");
colourMap.set("A495BB40-C5B1-4B44-B512-1370F02D74DE", "Purple");
colourMap.set("A495BB50-C5B1-4B44-B512-1370F02D74DE", "Orange");
colourMap.set("A495BB60-C5B1-4B44-B512-1370F02D74DE", "Blue");
colourMap.set("A495BB70-C5B1-4B44-B512-1370F02D74DE", "Yellow");
colourMap.set("A495BB80-C5B1-4B44-B512-1370F02D74DE", "Pink");

const fs = require('fs');
const calibrationPoints = loadCalibrationPoints();

module.exports.temperatureCelsius = (bleacon) => {
  return getCalibratedTemperature((bleacon.major - 32) / 1.8);
}


module.exports.specificGravity = (bleacon) => {
  return getCalibratedGravity(bleacon.minor / 1000);
}


module.exports.alcoholByVolume = (specificGravityAtStart, specificGravity) => {
  if (specificGravityAtStart)
  {
    return (95.82 * specificGravity * (specificGravityAtStart - specificGravity) / (1.775 - specificGravityAtStart)) / 100;
  }
  else {
    return null
  }
}


module.exports.alcoholByMass = (alcoholByVolume) => {
  if (alcoholByVolume) {
    return ((0.789 * alcoholByVolume) / (1 - 0.211 * alcoholByVolume));
  }
  else
  {
    return null
  }
}


module.exports.getTiltColour = (uuid) => {
    if (uuid) {
        return colourMap.get(uuid);
    }
}

function getCalibratedGravity (SG){

  var unCalSGPointsArray = calibrationPoints.gravity.uncalibrated 
  var actualSGPointsArray= calibrationPoints.gravity.calibrated 

  //temporary array for finding correct x and y values
  var unCalSGPointsTempArray = loadCalibrationPoints().gravity.uncalibrated 
  //add current value to calibration point list
  unCalSGPointsTempArray.push(SG);
  //sort list lowest to highest
  unCalSGPointsTempArray.sort(function(a, b){return a-b;});
  // console.log(unCalSGPointsArray);
  // console.log(unCalSGPointsTempArray);
  var indexSG = unCalSGPointsTempArray.indexOf(SG);
  var calSG = linearInterpolation (Number(SG), Number(unCalSGPointsArray[indexSG-1]), Number(actualSGPointsArray[indexSG-1]), Number(unCalSGPointsArray[indexSG]), Number(actualSGPointsArray[indexSG]));
  return String(Number(calSG).toFixed(4));
}
function getCalibratedTemperature (temp){

  var unCalTempPointsArray = calibrationPoints.temperature.uncalibrated 
  // console.log(unCalTempPointsArray);
  var actualTempPointsArray= calibrationPoints.temperature.calibrated 

  //temporary array for finding correct x and y values
  var unCalTempPointsTempArray = loadCalibrationPoints().temperature.uncalibrated 
  //add current value to calibration point list
  unCalTempPointsTempArray.push(temp);
  //sort list lowest to highest
  unCalTempPointsTempArray.sort(function(a, b){return a-b;});
  // console.log(unCalTempPointsTempArray);
  var indextemp = unCalTempPointsTempArray.indexOf(temp)-1;
  // console.log(unCalTempPointsArray);
  var caltemp = linearInterpolation(Number(temp), Number(unCalTempPointsArray[indextemp-1]), Number(actualTempPointsArray[indextemp-1]), Number(unCalTempPointsArray[indextemp]), Number(actualTempPointsArray[indextemp]));
  return String(Number(caltemp).toFixed(2));
}


function linearInterpolation (x, x0, y0, x1, y1) {
  // console.log(x + ", " + x0 + ", " + y0 + ", " + x1 + ", " + y1);
  var a = (y1 - y0) / (x1 - x0);
  // console.log("a:" + a);
  var b = -a * x0 + y0;
  // console.log("b:" + b);
  return a * x + b;
}

function loadCalibrationPoints (){
  let rawdata = fs.readFileSync('calibrationPoints.json');
  return JSON.parse(rawdata); 
}