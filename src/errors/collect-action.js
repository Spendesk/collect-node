const ActionError = require("./action");

class CollectAction extends ActionError {
  constructor(message, clientMessage) {
    super(message);

    this.type = "collect";
    this.clientMessage = clientMessage;
  }
}

module.exports = CollectAction;
