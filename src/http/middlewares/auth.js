const _ = require("lodash");

const ShipSettingsDecrypter = require("../../utils/ship-settings-decrypter");
const Client = require("../../client");
const CaptchaSolver = require("../../captcha-solver");

module.exports = (req, res, next) => {
  const token = req.headers["ship-token"];
  const encryptedSettings = JSON.parse(req.headers["ship-settings"]);
  const nextCollectAt = req.headers["ship-next-collect-at"];
  const captchaSolverToken = req.headers["captcha-solver-token"];

  if (!token || !encryptedSettings || !nextCollectAt) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const settings = new ShipSettingsDecrypter(encryptedSettings).decrypt();
  const id = _.first(_.split(Buffer.from(token, "base64").toString(), ":"));

  req.client = new Client(token, req.devMode);
  req.captchaSolver = new CaptchaSolver(captchaSolverToken);
  req.ship = {
    id,
    settings,
    nextCollectAt
  };

  return next();
};
