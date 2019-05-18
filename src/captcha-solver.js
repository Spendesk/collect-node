const delay = require("delay");
const superagent = require("superagent");

const CAPTCHA_CONFIG = require("./utils/config").captcha;

class CaptchaSolver {
  constructor(token) {
    this.token = token;
    this.agent = superagent.agent().set({ Accept: "application/json" });
  }

  async solveReCaptcha(googlekey, pageurl) {
    const reCaptchaRequestResponse = await this._reCaptchaRequestResponse(
      googlekey,
      pageurl
    );
    const reCaptchaRequestId = reCaptchaRequestResponse.body.request;

    return this._retrieveReCaptchaResult(reCaptchaRequestId);
  }

  async _retrieveReCaptchaResult(id) {
    const reCaptchaResultResponse = await this._reCaptchaResultResponse(id);

    if (reCaptchaResultResponse.body.request === "CAPCHA_NOT_READY") {
      await delay(1000);

      return this._retrieveReCaptchaResult(id);
    }

    return reCaptchaResultResponse.body.request;
  }

  _reCaptchaRequestResponse(googlekey, pageurl) {
    return this.agent.get(`http://${CAPTCHA_CONFIG.host}/in.php`).query({
      googlekey,
      pageurl,
      key: this.token,
      method: "userrecaptcha",
      json: "1"
    });
  }

  _reCaptchaResultResponse(id) {
    return this.agent.get(`http://${CAPTCHA_CONFIG.host}/res.php`).query({
      id,
      key: this.token,
      action: "get",
      json: "1"
    });
  }
}

module.exports = CaptchaSolver;
