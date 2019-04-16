const ActionError = require("./action");

class AuthAction extends ActionError {
  constructor(message, clientMessage, clientMetadata) {
    super(message, clientMessage);

    this.type = "auth";
    this.clientMetadata = clientMetadata;
  }
}

module.exports = AuthAction;
