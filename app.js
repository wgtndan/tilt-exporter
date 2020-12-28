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
    beacon.rssi = advertisement["rssi"];
    
    const temperature = Number(dataParser.temperatureCelsius(beacon));
    const specificGravity = Number(dataParser.specificGravity(beacon));
    const uncalTemperature = dataParser.uncalTemperatureCelsius(beacon);
    const uncalSpecificGravity = dataParser.uncalSpecificGravity(beacon);
    const colour = dataParser.getTiltColour(beacon.uuid);
    if (typeof colour === 'undefined') {
      // Not a Tilt Beacon
      logger.warn("Detected Non-Tilt Beacon: " + JSON.stringify(beacon));
      return;
    }

    countIBeacon.add(1, {tiltColour: colour});
    meterTemperature.bind({tiltColour: colour}).update(temperature);
    meterSpecificGravity.bind({tiltColour: colour}).update(specificGravity);
    meterUncalTemperature.bind({tiltColour: colour}).update(uncalTemperature);
    meterUncalSpecificGravity.bind({tiltColour: colour}).update(uncalSpecificGravity);

    logger.info("Valid Beacon, count: " + countReadings,
                ", temp: " + temperature,
                ", SG: " + specificGravity,
                ", uncalTemp: " + uncalTemperature,
                ", uncalSG: " + uncalSpecificGravity,
                ", colour: " + colour,
                ", uuid: " + beacon.uuid,
                ", rssi: " + beacon.rssi);
    
};

scanner.startScan().then(() => {
    logger.info("Scanning for BLE devices...")  ;
}).catch((error) => {
    logger.error(error);
    // console.log(error);
});