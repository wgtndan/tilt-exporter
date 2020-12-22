const Noble = require("noble");
const BeaconScanner = require("node-beacon-scanner");
const dataParser = require('./dataParser');

// MONITORING 
const { MeterProvider } = require('@opentelemetry/metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

// const meter = new MeterProvider().getMeter('tilt-exporter');

const prometheusPort = 9876;
const exporter = new PrometheusExporter(
    {
      startServer: true,
      port: prometheusPort
    },
    () => {
      console.log("prometheus scrape endpoint: http://localhost:"
        + prometheusPort 
        + "/metrics");
    }
  );
const meter = new MeterProvider({
    exporter,
    interval: 1000,
  }).getMeter('tilt-exporter');

const countIBeacon = meter.createCounter("iBeacons", {
    monotonic: true,
    labelKeys: ["tiltColour"],
    description: "Counts total number of iBeacons"
  });
const meterTemperature = meter.createValueObserver("temperature", {
    monotonic: false,
    labelKeys: ["tiltColour"],
    description: "Records temperature of Tilt"
});
const meterSpecificGravity = meter.createValueObserver("specificGravity", {
    monotonic: false,
    labelKeys: ["tiltColour"],
    description: "Records specificGravity of Tilt"
});


// const iBeaconCount = meter.createCounter("iBeacons", {
//   description: "Count all iBeacons advertised"
// });

// const labels = { pid: process.pid };

let countReadings = 0;

let specificGravityAtStart = null;

console.log("App Started");
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

var scanner = new BeaconScanner();

scanner.onadvertisement = (advertisement) => {
    countReadings++;
    var beacon = advertisement["iBeacon"];
    beacon.rssi = advertisement["rssi"];
    
    const temperature = dataParser.temperatureCelsius(beacon);
    const specificGravity = dataParser.specificGravity(beacon);
    const colour = dataParser.getTiltColour(beacon.uuid);

    countIBeacon.add(1, {tiltColour: colour});
    meterTemperature.bind({tiltColour: colour}).update(temperature);
    // meterSpecificGravity.observe(specificGravity, {tiltColour: colour});

    console.log("count: " + countReadings);
    console.log("temp:" + temperature);
    console.log("SG: " + specificGravity);
    console.log("colour: " + colour); 
    console.log("uuid: " + beacon.uuid);
    console.log("rssi: " + beacon.rssi);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    // console.log(JSON.stringify(beacon, null, "    "))
    // console.log("--------------------------------------")
};

scanner.startScan().then(() => {
    console.log("Scanning for BLE devices...")  ;
}).catch((error) => {
    console.error(error);
    console.log(error);
});