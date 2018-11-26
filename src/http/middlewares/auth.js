const Client = require("../../client");

module.exports = (req, res, next) => {
  req.client = new Client(req.headers["ship-token"]);
  req.ship = {
    settings: JSON.parse(req.headers["ship-settings"]),
    lastCollectedAt: req.headers["ship-last-collected-at"]
  };

  next();
};
