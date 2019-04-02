const puppeteer = require("puppeteer");

const utils = require("./utils/browser");

const launch = (options = {}) => {
  return puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--ignore-certificate-errors"
    ],
    ignoreHTTPSErrors: true,
    slowMo: 25,
    ...options
  });
};

module.exports = {
  launch,
  utils
};