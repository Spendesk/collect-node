const superagent = require("superagent");

const loggerUtil = require("./utils/logger");
const InvoiceUtil = require("./utils/invoice");

const CONFIG = require("./utils/config");

class Client {
  constructor(token) {
    this.agent = superagent
      .agent()
      .redirects(0)
      .set({
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`
      });
    this.logger = loggerUtil(token);
    this.invoice = new InvoiceUtil(this.agent);
  }

  done(hasError = false) {
    return this.agent
      .put(`https://${CONFIG.brokerHost}/ship-api`)
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
