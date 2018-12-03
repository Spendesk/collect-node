const CONFIG = require("./config");

class Invoice {
  constructor(agent) {
    this.agent = agent;
  }

  create(file, identifier, dueAt, options = {}) {
    return this.agent
      .post(`https://${CONFIG.brokerHost}/ship-api/invoices`)
      .attach("file", file, options)
      .field("identifier", identifier)
      .field("dueAt", dueAt)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}

module.exports = Invoice;
