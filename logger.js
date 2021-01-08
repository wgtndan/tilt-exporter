const { createLogger, format, transports, config } = require('winston');
const LokiTransport = require("winston-loki");
 
const logger = createLogger({
    levels: config.syslog.levels,
    transports: [
        new transports.Console({
            format: format.json()
        }),
        // new transports.File({ filename: 'combined.log' }),
        new LokiTransport({
            host: "http://rpi2.local:3100",
            json: true,
            labels: {service_name: 'tilt-exporter'}
        })
    ]
 });
 module.exports = logger;