const Noble = require("noble");
const BeaconScanner = require("node-beacon-scanner");
const dataParser = require('./dataParser');

let specificGravityAtStart = null;

console.log("App Started");
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

var scanner = new BeaconScanner();

scanner.onadvertisement = (advertisement) => {
    var beacon = advertisement["iBeacon"];
    beacon.rssi = advertisement["rssi"];
    const temperature = dataParser.temperatureCelsius(beacon);
    const specificGravity = dataParser.specificGravity(beacon);
    const alcoholByVolume = dataParser.alcoholByVolume(specificGravityAtStart, specificGravity);
    const alcoholByMass = dataParser.alcoholByMass(alcoholByVolume);
    const colour = dataParser.getTiltColour(beacon.uuid);
    console.log("temp:" + temperature);
    console.log("SG: " + specificGravity);
    console.log("abv: " + alcoholByVolume);
    console.log("colour: " + colour); 
    console.log("uuid: " + beacon.uuid);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(JSON.stringify(beacon, null, "    "))
    console.log("--------------------------------------")
};

scanner.startScan().then(() => {
    console.log("Scanning for BLE devices...")  ;
}).catch((error) => {
    console.error(error);
    console.log(error);
});