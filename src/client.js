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
        Authorization: `Bearer ${token}`
      });
    this.logger = loggerUtil(token);
    this.invoice = new InvoiceUtil(this.agent);
  }

  done() {
    this.agent.put(`${CONFIG.brokerHost}/ship-api`).send({ isCollected: true });
  }
}

module.exports = Client;
