class Action extends Error {
  constructor(message, clientMessage) {
    super(message);

    this.clientMessage = clientMessage || message;
  }
}

module.exports = Action;
