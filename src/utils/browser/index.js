/* eslint-disable no-undef */
const { getSanitizedInvoicesData } = require("./invoices-data");
const pageEvaluator = require("./page-evaluator");

function isObject(value) {
  return value && typeof value === "object" && value.constructor === Object;
}

 /**
 * @see: https://github.com/GoogleChrome/puppeteer/issues/3358
 * @see: https://github.com/GoogleChrome/puppeteer/issues/433#event-1490301931
 * @param {Puppeteer.page} page
 * @param {string} frameName
 * @returns {!Promise<Puppeteer.Frame>}
 */
const getTargetFrame = async (page, frameName) => {
  const iFrameXPath = `//iframe[@id='${frameName}' or @name='${frameName}']`;

  await page.waitFor(iFrameXPath);

  const frameElement = await page.$x(iFrameXPath).then(handles => handles[0]);
  const frame = frameElement.contentFrame();

  await frameElement.dispose();

  return frame;
};

 /**
 * @param {Puppeteer.page} page
 * @param {string|{frameName: string, xpath: string, sel: string}} context
 */
const splitContext = async (page, context) => {
  let targetFrame = page;
  let selector = context;

   if (
    isObject(context) &&
    Object.prototype.hasOwnProperty.call(context, "frameName") &&
    Object.prototype.hasOwnProperty.call(context, "sel")
  ) {
    const { frameName, sel } = context;
    targetFrame = await getTargetFrame(page, frameName);
    selector = sel;
  } else if (
    isObject(context) &&
    Object.prototype.hasOwnProperty.call(context, "frameName")
  ) {
    const { frameName, ...sel } = context;
    targetFrame = await getTargetFrame(page, frameName);
    selector = sel;
  }
  return {
    targetFrame,
    selector
  };
};

 /**
 * Check if node element exists in the DOM
 * @param {Puppeteer.Page} page
 * @param {string|{frameName: string, xpath: string}} context Could be either a CSS or XPath selector
 * @returns {!Promise<boolean>}
 */
const hasElement = async (page, context) => {
  const { targetFrame, selector } = await splitContext(page, context);
  return targetFrame
    .evaluate(sel => _utils_.count(sel), selector)
    .then(count => !!count);
};

 /**
 * @param {Puppeteer.page} page
 * @param {string|{frameName: string, sel: string}} context
 * @param {*} options
 */
const waitForSelector = async (page, context, options = {}) => {
  const xPathPattern = "//";
  const { targetFrame, selector } = await splitContext(page, context);

   if (selector.startsWith(xPathPattern))
    return targetFrame.waitForXPath(selector, options);
  return targetFrame.waitForSelector(selector, options);
};

 /**
 * @param {Puppeteer.Page} page
 * @param {{!frameName: string, !_wrapper_: string, dueAt: string|Array, identifier: string|Array, amount: string|Array, currency: string|Array}} xpaths
 */
const extractInvoicesData = async (page, xpaths) => {
  const { targetFrame, selector } = await splitContext(page, xpaths);
  return targetFrame
    .evaluate(
      xpathMapping => _utils_.getDataFromMapping(xpathMapping),
      selector
    )
    .then(objectsList => {
      if (!objectsList) return [];
      return getSanitizedInvoicesData(objectsList).filter(invoice => invoice.amount);
    });
};

 /**
 * @param {Puppeteer.page} page
 * @param {string|{frameName: string, xpath: string}} context
 */
const getElemHandle = async (page, context) => {
  const xPathPattern = "//";
  const { targetFrame, selector } = await splitContext(page, context);
  const elemExists = await hasElement(targetFrame, selector);
  if (!elemExists) {
    console.log(` Node does not exist: ${selector}`);
    return Promise.reject(new Error("ELEMENT_DOES_NOT_EXIST"));
  }
  return selector.startsWith(xPathPattern)
    ? targetFrame.$x(selector).then(handle => handle[0])
    : targetFrame.$(selector);
};

 /**
 * Click on an Element
 * @param {Puppeteer.Page} page
 * @param {string|{frameName: string, xpath: string}} selector
 * @param {*} options
 * @returns {!Promise}
 */
const clickOnElem = async (page, selector, options = {}) => {
  const elemHandle = await getElemHandle(page, selector);
  await elemHandle.click(options);
  return elemHandle.dispose();
};

 /**
 * Click on an Element and waits for specific selector
 * @param {Puppeteer.Page} page
 * @param {{elemToClick: (string|{frameName: string, sel: string}), elemToExpect: (string|{frameName: string, sel: string})}} selectors
 * @returns {!Promise}
 */
const clickOnElemAndWaitFor = async (page, selectors) => {
  await clickOnElem(page, selectors.elemToClick);
  await page.waitForFunction("window._utils_ !== undefined");
  await waitForSelector(page, selectors.elemToExpect);
};

 /**
 * @param {Puppeteer.Page} page
 * @param {string|{frameName: string, sel: string}} selector
 * @param {string} text
 * @param {*} options
 */
const clickOnElemAndType = async (page, selector, text, options) => {
  const elemHandle = await getElemHandle(page, selector);
  await elemHandle.click(options);
  await page.waitFor(500);
  await elemHandle.type(text, options);
  return elemHandle.dispose();
};

 /**
 * @param {Puppeteer.page} page
 * @param {string|{frameName: string, sel: string}} selector
 * @param {string} text
 * @param {{delay: (number|undefined)}=} options
 */
const typeIn = async (page, selector, text, options) => {
  const elemHandle = await getElemHandle(page, selector);
  await elemHandle.type(text, options);
  await elemHandle.dispose();
};

 /**
 * @param {Page.Puppeteer} page
 * @param {Array<Cookie>} cookies
 */
const setCookies = async (page, cookies) => {
  const items = cookies
    .map(cookie => {
      const item = Object.assign({}, cookie);
      if (!item.value) item.value = "";
      console.assert(!item.url, "Cookies must have a URL defined");
      console.assert(
        item.url !== "about:blank",
        `Blank page can not have cookie "${item.name}"`
      );
      console.assert(
        !String.prototype.startsWith.call(item.url || "", "data:"),
        `Data URL page can not have cookie "${item.name}"`
      );
      return item;
    })
    .filter(cookie => cookie.name);

   await page.deleteCookie(...items);

   if (items.length)
    await page._client.send("Network.setCookies", { cookies: items });
};

 /**
 * @param {Puppeteer.Page} page
 * @param {string|Array<Cookie>} cookies
 * @returns {!Promise}
 */
const initPageCookies = (page, cookies) => {
  if (typeof cookies === "string" || cookies instanceof String) {
    try {
      const cookiesArray = JSON.parse(cookies);
      return setCookies(page, cookiesArray);
    } catch (err) {
      console.log("Data is not in JSON format");
    }
  } else return setCookies(page, cookies);
  console.log(" [initPageCookies] No valid cookies specified !");
  return false;
};

 /**
 * @see: https://gist.github.com/jeroenvisser101/636030fe66ea929b63a33f5cb3a711ad
 * @param {Puppeteer.Page} page
 * @returns {!Promise<Array<Cookie>>}
 */
const getCookies = page => {
  return page._client
    .send("Network.getAllCookies", {})
    .then(({ cookies }) => cookies);
};

 /**
 * @param {Puppeteer.Page} page
 * @param {Client} client
 * @returns {!Promise}
 */
const saveCookies = async (page, client) => {
  const cookies = await getCookies(page);
  return client.cookies && typeof client.cookies.save === "function"
    ? client.cookies.save(cookies)
    : false;
};

 /**
 * @param {Puppeteer.browser} browser
 * @param {{validUrlRegex: RegExp, injectUtils: boolean}} options
 * @returns {!Promise}
 */
const getNewPageWhenLoaded = (
  browser,
  { validUrlRegex = new RegExp(), injectUtils = true }
) => {
  return new Promise(x =>
    browser.once("targetcreated", async target => {
      const isTargetTypePage = target.type() === "page";
      const isTargetURLValid = validUrlRegex.test(target.url());

      if (!(isTargetTypePage && isTargetURLValid)) {
        console.log("getNewPageWhenLoaded - Target not valid.");
        return false;
      }

      console.log(
        "getNewPageWhenLoaded - Newly created target page is valid :)"
      );

      const newPage = await target.page();

      const newPagePromise = new Promise(() =>
        newPage.once("domcontentloaded", () => x(newPage))
      );
      const isPageLoaded = await newPage.evaluate(() => document.readyState);
      if (injectUtils) await newPage.mainFrame().evaluate(pageEvaluator);
      console.log(
        "getNewPageWhenLoaded - Reached 'isPageLoaded' step : document.readyState !"
      );
      return isPageLoaded.match("complete|interactive")
        ? x(newPage)
        : newPagePromise;
    })
  );
};

 /**
 * @param {Puppeteer.Browser} browser
 * @param {Client} client
 * @param {{cookies: (string|Array<Cookie>)}} options
 */
const getNewPage = async (browser, client, { cookies } = { cookies: null }) => {
  const page = await browser.newPage();

  if (cookies) {
    client.logger.info("getNewPage.injectingCookies");
    await initPageCookies(page, cookies);
  }
  await page.evaluateOnNewDocument(pageEvaluator);
  return page;
};

 module.exports = {
  getNewPage,
  getNewPageWhenLoaded,
  clickOnElem,
  clickOnElemAndWaitFor,
  clickOnElemAndType,
  extractInvoicesData,
  hasElement,
  typeIn,
  saveCookies,
  waitForSelector
};
