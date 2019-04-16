const ActionError = require("./action");

class CollectAction extends ActionError {
  constructor(message, clientMessage) {
    super(message, clientMessage);

    this.type = "collect";
  }
}

module.exports = CollectAction;
