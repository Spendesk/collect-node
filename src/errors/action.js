class Action extends Error {
  constructor(message, clientMessage) {
    super(message);

    this.clientMessage = clientMessage;
  }
}

module.exports = Action;
