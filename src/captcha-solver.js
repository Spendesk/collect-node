const _ = require("lodash");
const delay = require("delay");
const superagent = require("superagent");

const DEATH_BY_CAPTCHA_CONFIG = require("./utils/config").deathByCaptcha;

class CaptchaSolver {
  constructor(token) {
    [ this.username, this.password ] = _.split(Buffer.from(token, "base64").toString(), ":");

    this.agent = superagent
      .agent()
      .redirects(1)
      .set({ "Accept": "application/json" });
  }

  async solveReCaptcha(googlekey, pageurl, proxy, proxytype) { 
    const reCaptchaRequest = await this._reCaptchaRequest({ googlekey, pageurl, proxy, proxytype });
    const reCaptchaRequestId = reCaptchaRequest.body.captcha;

    await delay(DEATH_BY_CAPTCHA_CONFIG.timeout);

    const reCaptchaResponse = await this._reCaptchaResponse(reCaptchaRequestId);

    return reCaptchaResponse.body;
  }

  _reCaptchaRequest(params) {
    return this.agent
      .type("form")
      .post(`http://${DEATH_BY_CAPTCHA_CONFIG.host}/api/captcha`)
      .send({
        username: this.username,
        password: this.password,
        type: 4,
        token_params: JSON.stringify(_.pickBy(params))
      });
  }

  _reCaptchaResponse(id) {
    return this.agent
      .type("form")
      .get(`http://${DEATH_BY_CAPTCHA_CONFIG.host}/api/captcha/${id}`)
      .send();
  }
}

module.exports = CaptchaSolver;