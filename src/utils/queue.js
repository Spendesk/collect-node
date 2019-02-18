const kue = require("kue");

module.exports = kue.createQueue({
  redis: process.env.REDIS_URL
});
