const { matchPairs } = require("pampy");

const monthsMap = {
  "01": ["jan", "janvier", "january"],
  "02": ["fev", "feb", "février", "fevrier", "february"],
  "03": ["mar", "mars", "march"],
  "04": ["avr", "apr", "avril", "april"],
  "05": ["mai", "may"],
  "06": ["juin", "jun", "june"],
  "07": ["jul", "juillet", "july"],
  "08": ["aout", "août", "aug", "august"],
  "09": ["sep", "septembre", "september"],
  "10": ["oct", "octobre", "october"],
  "11": ["nov", "november", "november"],
  "12": ["dec", "decembre", "décembre", "december"]
};

const getMonthNumber = monthString => {
  console.log(` Got month string: ${monthString}`);
  const monthStringNormalized = monthString.toLowerCase();
  const monthEntries = Object.entries(monthsMap);
  const [monthNumber] = monthEntries.find(monthEntry =>
    monthEntry[1].includes(monthStringNormalized)
  );

  return monthNumber;
};

const verboseRgx = /^(\d+)\s+(Jan(?:nuary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:tempber)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{2,4})$/i;
const FR_regex = /(\d\d)[/-](\d\d)[/-](\d{4})/i;
const EN_regex = /(\d{4})[/-](\d\d)[/-](\d\d)/i;
// eslint-disable-next-line no-useless-escape
const amountRegex = /(\d+[,\.]\d+)/i;
const currencyRegex = /(\$|€|£)/i;

const mapInvertedDate = (...items) => {
  const [, day, month, year] = items;
  const monthNumber = /\d\d/i.test(month) ? month : getMonthNumber(month);
  return new Date(`${year}-${monthNumber}-${day}`);
};

const mapDate = (...items) => {
  const [, year, month, day] = items;
  const monthNumber = /\d\d/i.test(month) ? month : getMonthNumber(month);
  return new Date(`${year}-${monthNumber}-${day}`);
};

const replaceFRDate = rgx => string => string.replace(rgx, mapInvertedDate);
const replaceENDate = rgx => string => string.replace(rgx, mapDate);

const matchDate = string => {
  console.log(`About to treat string: ${string}`);
  return matchPairs(
    string,
    [x => verboseRgx.test(x), replaceFRDate(verboseRgx)],
    [x => EN_regex.test(x), replaceENDate(EN_regex)],
    [x => FR_regex.test(x), replaceFRDate(FR_regex)]
  );
};

const parseAmount = string => {
  const [, amount] = string.match(amountRegex);
  const normalizedAmount = amount.replace(",", ".");
  return parseFloat(normalizedAmount);
};

const matchAmount = string => {
  return matchPairs(string, [x => amountRegex.test(x), parseAmount]);
};

const parseCurrency = string => {
  const symbolCurrencies = {
    "€": "euro",
    "£": "pound",
    $: "dollar"
  };
  const [, symbol] = string.match(currencyRegex);
  return symbolCurrencies[symbol];
};

const matchCurrency = string => {
  return matchPairs(
    string,
    [x => currencyRegex.test(x), parseCurrency],
    [x => !currencyRegex.test(x), "unknown"]
  );
};

 /**
 * @param {Array<{dueAt: Date, identifier: string, amount: float, currency: string}>} objectsList
 */
const getSanitizedInvoicesData = (objectsList = []) => {
  objectsList.map(({ dueAt, amount = null, ...item }) => {
    return {
      dueAt: matchDate(dueAt),
      amount: matchAmount(amount),
      currency: matchCurrency(amount),
      ...item
    };
  });
};

module.exports = {
  getSanitizedInvoicesData
};
