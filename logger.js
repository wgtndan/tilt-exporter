const { createLogger, format, transports, config } = require('winston');
const LokiTransport = require("winston-loki");
 
const logger = createLogger({
    levels: config.syslog.levels,
    transports: [
        new transports.Console(),
        // new transports.File({ filename: 'combined.log' }),
        new LokiTransport({
            host: "http://rpi2.local:3100",
            json: true
        })
    ]
 });
 module.exports = logger;