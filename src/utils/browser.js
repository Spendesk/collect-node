const puppeteer = require("puppeteer");

module.exports = (devMode = false) => {
  return puppeteer.launch({
    headless: !devMode,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
};
