const _ = require("lodash");

const SettingsDecrypter = require("../../utils/settings-decrypter");
const Client = require("../../client");
const CaptchaSolver = require("../../captcha-solver");

module.exports = (req, res, next) => {
  const {
    token,
    settings,
    currentSettingsStepTag,
    nextCollectAt,
    captchaSolverToken
  } = req.body;

  if (!token || !settings || !nextCollectAt) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const decryptedSettings = new SettingsDecrypter(settings).decrypt();
  const id = _.first(_.split(Buffer.from(token, "base64").toString(), ":"));

  req.clientOptions = {
    token,
    devMode
  };
  req.captchaSolverOptions = {
    token: captchaSolverToken
  };
  req.ship = {
    id,
    settings: decryptedSettings,
    currentSettingsStepTag,
    nextCollectAt
  };

  return next();
};
