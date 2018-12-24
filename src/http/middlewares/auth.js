const _ = require("lodash");

const ShipSettingsDecryption = require("../../utils/ship-settings-decryption");
const Client = require("../../client");

module.exports = (req, res, next) => {
  const token = req.headers["ship-token"];
  const encryptedSettings = req.headers["ship-settings"];
  const lastCollectedAt = req.headers["ship-last-collected-at"];

  if (!token || !settings || !lastCollectedAt) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const settings = new ShipSettingsDecryption(settings).decrypt();
  const id = _.first(_.split(Buffer.from(token, "base64").toString(), ":"));

  req.client = new Client(token);
  req.ship = {
    id,
    settings,
    lastCollectedAt
  };

  return next();
};
