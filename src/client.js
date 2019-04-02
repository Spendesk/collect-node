const superagent = require("superagent");

const loggerClientUtil = require("./utils/client/logger");
const InvoiceClientUtil = require("./utils/client/invoice");

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
    this.logger = loggerClientUtil(token, this.environment);
    this.invoice = new InvoiceClientUtil(this.agent, this.environment);
  }

  done(status, metadata) {
    return this.agent
      .put(`https://${CONFIG.broker[this.environment]}/ship-api`)
      .send({ status, metadata });
  }
}

module.exports = Client;
