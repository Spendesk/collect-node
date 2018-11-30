const winston = require("winston");

const CONFIG = require("./config");

module.exports = token => {
  return winston.createLogger({
    levels: winston.config.npm.levels,
    transports: [
      new winston.transports.Console({
        level: "silly",
        json: true,
        stringify: true
      }),
      new winston.transports.Http({
        host: CONFIG.brokerHost,
        ssl: true,
        path: "/ship-api/logs",
        headers: { authorization: `Basic ${token}` }
      })
    ]
  });
};
