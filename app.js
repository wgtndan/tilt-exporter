const Noble = require("noble");
const BeaconScanner = require("node-beacon-scanner");
const dataParser = require('./dataParser');
const logger = require('./logger');

// MONITORING 
const { MeterProvider } = require('@opentelemetry/metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const prometheusPort = 9876;
const exporter = new PrometheusExporter(
    {
      startServer: true,
      port: prometheusPort
    },
    () => {
      logger.info("prometheus scrape endpoint: http://raspberrypi.local:"
        + prometheusPort 
        + "/metrics");
    }
  );
const meter = new MeterProvider({
    exporter,
    interval: 900,
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
const meterUncalTemperature = meter.createValueObserver("uncalTemperature", {
  monotonic: false,
  labelKeys: ["tiltColour"],
  description: "Records Uncalibrated temperature of Tilt"
});
const meterUncalSpecificGravity = meter.createValueObserver("uncalSpecificGravity", {
  monotonic: false,
  labelKeys: ["tiltColour"],
  description: "Records Uncalibrated specificGravity of Tilt"
});


let countReadings = 0;

logger.info("tilt-exporter Started");
//console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

var scanner = new BeaconScanner();

scanner.onadvertisement = (advertisement) => {
    countReadings++;
    var beacon = advertisement["iBeacon"];

    logger.info("New Beacon Received", tiltbeacon);
    beacon.rssi = advertisement["rssi"];

    var tiltbeacon = {};
    tiltbeacon.uuid = beacon.uuid;
    tiltbeacon.rssi = beacon.rssi;    
    tiltbeacon.colour = dataParser.getTiltColour(beacon.uuid);
    if (typeof tiltbeacon.colour === 'undefined') {
      // Not a Tilt Beacon
      logger.warn("Detected Non-Tilt Beacon", beacon.uuid);
      return;
    } 

    //Custom Tilt Beacon Values
    tiltbeacon.temperature = Number(dataParser.temperatureCelsius(beacon));
    tiltbeacon.specificGravity = Number(dataParser.specificGravity(beacon));
    tiltbeacon.uncalTemperature = Number(dataParser.uncalTemperatureCelsius(beacon));
    tiltbeacon.uncalSpecificGravity = Number(dataParser.uncalSpecificGravity(beacon));


    logger.verbose("Bind Count");
    countIBeacon.add(1, {tiltColour: tiltbeacon.colour});
    logger.verbose("Bind Temp");
    meterTemperature.bind({tiltColour: tiltbeacon.colour}).update(tiltbeacon.temperature);
    logger.verbose("Bind SG");
    meterSpecificGravity.bind({tiltColour: tiltbeacon.colour}).update(tiltbeacon.specificGravity);
    logger.verbose("Bind UCTemp");
    meterUncalTemperature.bind({tiltColour: tiltbeacon.colour}).update(tiltbeacon.uncalTemperature);
    logger.verbose("Bind UCSG");
    meterUncalSpecificGravity.bind({tiltColour: tiltbeacon.colour}).update(tiltbeacon.uncalSpecificGravity);

    logger.info("Valid Beacon Processed", tiltbeacon);
    
};

scanner.startScan().then(() => {
    logger.info("Scanning for BLE devices...")  ;
}).catch((error) => {
    logger.error(error);
});