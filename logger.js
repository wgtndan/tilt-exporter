const { createLogger, format, transports, config } = require('winston');
 
const logger = createLogger({
    levels: config.syslog.levels,
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'combined.log' })
    ]
 });
 module.exports = logger;