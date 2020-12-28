const { createLogger, format, transports, config } = require('winston');
const LokiTransport = require("winston-loki");
 
const logger = createLogger({
    levels: config.syslog.levels,
    transports: [
        new transports.Console({level: this.verbose}),
        // new transports.File({ filename: 'combined.log' }),
        new LokiTransport({
            host: "http://rpi2.local:3100",
            json: true,
            labels: {testing: 'true'},
            level: info
        })
    ]
 });
 module.exports = logger;