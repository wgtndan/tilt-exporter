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

module.exports.temperatureCelsius = (bleacon) => {
  return (bleacon.major - 32) / 1.8;
}


module.exports.specificGravity = (bleacon) => {
  return bleacon.minor / 1000;
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
        return Map.get(uuid);
    }
}

