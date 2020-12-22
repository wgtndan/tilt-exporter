const Noble = require("noble");
const BeaconScanner = require("node-beacon-scanner");

console.log("App Started");
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

var scanner = new BeaconScanner();

scanner.onadvertisement = (advertisement) => {
    var beacon = advertisement["iBeacon"];
    beacon.rssi = advertisement["rssi"];
    const temperature = dataParser.temperatureCelsius(bleacon);
    const specificGravity = dataParser.specificGravity(bleacon);
    const alcoholByVolume = dataParser.alcoholByVolume(specificGravityAtStart, specificGravity);
    const alcoholByMass = dataParser.alcoholByMass(alcoholByVolume);
    console.log("temp:" + temperature);
    console.log("SG: " + specificGravity);
    console.log("abv: " + alcoholByVolume);
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