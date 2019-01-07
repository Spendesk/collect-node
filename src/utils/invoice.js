const CONFIG = require("./config");

class Invoice {
  constructor(agent, environment) {
    this.environment = environment;
    this.agent = agent;
  }

  create(file, metadata, fileOptions = {}) {
    return this.agent
      .post(`https://${CONFIG.broker[this.environment]}/ship-api/invoices`)
      .attach("file", file, fileOptions)
      .field("identifier", metadata.identifier)
      .field("dueAt", metadata.dueAt)
      .field("amount", metadata.amount)
      .field("currency", metadata.currency)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}

module.exports = Invoice;
