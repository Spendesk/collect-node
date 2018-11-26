const CONFIG = require("./config");

class Invoice {
  constructor(agent) {
    this.agent = agent;
  }

  create(filePath, fileIdentifier) {
    this.agent
      .post(`${CONFIG.brokerHost}/ship-api/invoices`)
      .attach("file", filePath)
      .field("fileIdentifier", fileIdentifier);
  }
}

module.exports = Invoice;
