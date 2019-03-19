const ActionError = require("./action");

class AuthAction extends ActionError {
  constructor(message, clientMessage, clientMetadata) {
    super(message);

    this.type = "auth";
    this.clientMessage = clientMessage;
    this.clientMetadata = clientMetadata;
  }
}

module.exports = AuthAction;
