const superagent = require("superagent");

const loggerUtil = require("./utils/logger");
const InvoiceUtil = require("./utils/invoice");

const CONFIG = require("./utils/config");

class Client {
  constructor(token, devMode = false) {
    this.environment = devMode ? "development" : "production";
    this.agent = superagent
      .agent()
      .set({
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`
      });
    this.logger = loggerUtil(token, this.environment);
    this.invoice = new InvoiceUtil(this.agent, this.environment);
  }

  done(status, metadata) {
    return this.agent
      .put(`https://${CONFIG.broker[this.environment]}/ship-api`)
      .send({ status, metadata });
  }
}

module.exports = Client;
