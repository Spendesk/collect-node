const _ = require("lodash");

const ShipSettingsDecryption = require("../../utils/ship-settings-decryption");
const Client = require("../../client");
const CaptchaSolver = require("../../captcha-solver");

module.exports = (req, res, next) => {
  const token = req.headers["ship-token"];
  const encryptedSettings = JSON.parse(req.headers["ship-settings"]);
  const lastCollectedAt = req.headers["ship-last-collected-at"];
  const captchaSolverToken = req.headers["captcha-solver-token"];

  if (!token || !encryptedSettings || !lastCollectedAt) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const settings = new ShipSettingsDecryption(encryptedSettings).decrypt();
  const id = _.first(_.split(Buffer.from(token, "base64").toString(), ":"));

  req.client = new Client(token);
  req.captchaSolver = new CaptchaSolver(captchaSolverToken);
  req.ship = {
    id,
    settings,
    lastCollectedAt
  };

  return next();
};
