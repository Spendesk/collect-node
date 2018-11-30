const Client = require("../../client");

module.exports = (req, res, next) => {
  const token = req.headers["ship-token"];
  const settings = req.headers["ship-settings"];
  const lastCollectedAt = req.headers["ship-last-collected-at"];

  if (!token || !settings || !lastCollectedAt) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  req.client = new Client(req.headers["ship-token"]);
  req.ship = {
    settings: JSON.parse(req.headers["ship-settings"] || {}),
    lastCollectedAt: req.headers["ship-last-collected-at"]
  };

  return next();
};
