const superagent = require("superagent");

const loggerUtil = require("./utils/logger");
const InvoiceUtil = require("./utils/invoice");

const CONFIG = require("./utils/config");

class Client {
  constructor(token, devMode = false) {
    this.environment = devMode ? "development" : "production";
    this.agent = superagent
      .agent()
      .redirects(0)
      .set({
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`
      });
    this.logger = loggerUtil(token, this.environment);
    this.invoice = new InvoiceUtil(this.agent, this.environment);
  }

  status(label, message) {
    return this.agent
      .put(`https://${CONFIG.broker[this.environment]}/ship-api`)
      .send({ status: { label, message } })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  done(hasError = false) {
    return this.agent
      .put(`https://${CONFIG.broker[this.environment]}/ship-api`)
      .send({ isRunning: false, hasError })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}

module.exports = Client;
