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
      logger.info("prometheus scrape endpoint: http://rpi1.local:"
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
    labelKeys: ["tiltColour","batchLabel"],
    description: "Counts total number of iBeacons"
  });
const meterTemperature = meter.createValueObserver("temperature", {
    monotonic: false,
    labelKeys: ["tiltColour","batchLabel"],
    description: "Records temperature of Tilt"
});
const meterSpecificGravity = meter.createValueObserver("specificGravity", {
    monotonic: false,
    labelKeys: ["tiltColour","batchLabel"],
    description: "Records specificGravity of Tilt"
});
const meterUncalTemperature = meter.createValueObserver("uncalTemperature", {
  monotonic: false,
  labelKeys: ["tiltColour","batchLabel"],
  description: "Records Uncalibrated temperature of Tilt"
});
const meterUncalSpecificGravity = meter.createValueObserver("uncalSpecificGravity", {
  monotonic: false,
  labelKeys: ["tiltColour","batchLabel"],
  description: "Records Uncalibrated specificGravity of Tilt"
});


let countReadings = 0;

logger.info("tilt-exporter Started");
//console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

var scanner = new BeaconScanner();

scanner.onadvertisement = (advertisement) => {
    countReadings++;
    var beacon = advertisement["iBeacon"];

    logger.info({message: "New Beacon Received", labels: {'tilt_exporter_uuid': beacon.uuid}, beacon});
    beacon.rssi = advertisement["rssi"];

    var tiltbeacon = {};
    tiltbeacon.uuid = beacon.uuid;
    tiltbeacon.rssi = beacon.rssi;    
    tiltbeacon.colour = dataParser.getTiltColour(beacon.uuid);
    tiltbeacon.batchLabel = dataParser.getBatchLabel();
    
    if (typeof tiltbeacon.colour === 'undefined') {
      // Not a Tilt Beacon
      console.log("Random Detected Non-Tilt Beacon", beacon);
      logger.warn({message: "Detected Non-Tilt Beacon", labels: {'tilt_exporter_uuid': beacon.uuid}});
      return;
    } 

    //Custom Tilt Beacon Values
    tiltbeacon.temperature = Number(dataParser.temperatureCelsius(beacon));
    tiltbeacon.specificGravity = Number(dataParser.specificGravity(beacon));
    tiltbeacon.uncalTemperature = Number(dataParser.uncalTemperatureCelsius(beacon));
    tiltbeacon.uncalSpecificGravity = Number(dataParser.uncalSpecificGravity(beacon));

    countIBeacon.add(1, {tiltColour: tiltbeacon.colour, batchLabel: tiltbeacon.batchLabel});
    meterTemperature.bind({tiltColour: tiltbeacon.colour, batchLabel: tiltbeacon.batchLabel}).update(tiltbeacon.temperature);
    meterSpecificGravity.bind({tiltColour: tiltbeacon.colour, batchLabel: tiltbeacon.batchLabel}).update(tiltbeacon.specificGravity);
    meterUncalTemperature.bind({tiltColour: tiltbeacon.colour, batchLabel: tiltbeacon.batchLabel}).update(tiltbeacon.uncalTemperature);
    meterUncalSpecificGravity.bind({tiltColour: tiltbeacon.colour, batchLabel: tiltbeacon.batchLabel}).update(tiltbeacon.uncalSpecificGravity);

    // logger.info({message: "Valid Beacon Processed", labels:{'tilt_exporter_colour': tiltbeacon.colour, 'tilt_exporter_batchLanel': tiltbeacon.batchLabel, 'tilt_exporter_uuid':tiltbeacon.uuid},  tiltbeacon});
    logger.info({message: "Valid Beacon Processed", labels:{'tilt_exporter_colour': tiltbeacon.colour, 'tilt_exporter_batchLanel': tiltbeacon.batchLabel, 'tilt_exporter_uuid':tiltbeacon.uuid, 'temperature':tiltbeacon.temperature, 'specificGravity':tiltbeacon.specificGravity}});
};

scanner.startScan().then(() => {
    logger.info("Scanning for BLE devices...")  ;
}).catch((error) => {
    logger.error(error);
});