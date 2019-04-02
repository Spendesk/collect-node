module.exports = () => {
  const isValidRegex = regex =>
    regex !== null &&
    (regex instanceof RegExp ||
      (regex === Object(regex) && regex.constructor.name === "RegExp"));

  const _callbackUtils = {
    _apply(_data, { multi = false, ...callbacks }) {
      if (Array.isArray(_data) && multi) {
        return _data.map(_dataSingle =>
          this._apply(_dataSingle, { multi: false, callbacks })
        );
      }
      const data = Array.isArray(_data) && !multi ? _data[0] : _data;

       const tmpData = Object.keys(callbacks).reduce((acc, callbackName) => {
        if (
          !Object.prototype.hasOwnProperty.call(callbacks, callbackName) ||
          !Object.prototype.hasOwnProperty.call(this, callbackName)
        ) {
          return acc;
        }
        return this[callbackName](acc, callbacks[callbackName]);
      }, data);

       const finalData = Array.isArray(tmpData) ? tmpData : [tmpData];
      return multi ? finalData : finalData[0];
    },

     convertFRStringToDate(dateString) {
      const dateSplit = dateString.split("/");
      const invoiceDate = new Date(
        `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`
      );
      return invoiceDate;
    },
    extract(data, regexParam) {
      // Make sure we don't try to extract String subpart from null-string
      if (!data) {
        return null;
      }

       const regex =
        typeof regexParam === "string" || regexParam instanceof String
          ? new RegExp(regexParam)
          : regexParam;

       if (!isValidRegex(regex)) {
        return data;
      }

       const rgxres = data.match(regex);
      if ([null, undefined].includes(rgxres)) {
        return "";
      }

       let datares = rgxres[1];

       // IF dealing with a 'multiple cases' regex extraction (contains '|' ; i.e boolean 'OR' operator)
      // Find the first non-null, non-undefined match
      if (/\|/.test(regex)) {
        const [, ...matches] = rgxres;
        [datares] = matches.filter(item => item !== undefined && item !== null);
      }

       const isNum = /^\/\(\\d\+\)\/i?$/.test(regex);
      return isNum ? parseInt(datares, 10) : datares;
    },
    extractFloat(data) {
      return this.parseFloat(this.extract(data, /(\d+[,\.]\d+)/i));
    },
    extractInteger(data) {
      return this.extract(data, /(\d+)/i);
    },
    mapCurrency(data) {
      const symbolCurrencies = {
        "€": "euro",
        "£": "pound",
        "$": "dollar"
      };
      return symbolCurrencies[data] || "unknown";
    },
    parseFloat(data) {
      return parseFloat(data.replace(",", "."));
    },
    toString(data) {
      return data.toString();
    }
  };

  window._utils_ = {
    isXPath: selector => selector.startsWith("//"),

    /**
     * 
     * @param {string} selector
     * @param {object} scope
     */
    count(selector, scope = document) {
      try {
        return this.isXPath(selector)
          ? this.getElementsByXPath(selector, scope).length
          : Array.from(document.querySelectorAll(selector)).length;
      } catch (e) {
        return 0;
      }
    },

    /**
     * 
     * @param {string} url
     */
    getPFDAsArrayBufferString(url) {
      /**
       * Convert an ArrayBuffer to an UTF-8 String
       * @param {ArrayBuffer} buffer
       */
      const arrayBufferToString = buffer => {
        const bufView = new Uint8Array(buffer);
        const length = bufView.length;

         let result = "";
        let addition = 2 ** 8 - 1;

         for (let i = 0; i < length; i += addition) {
          if (i + addition > length) {
            addition = length - i;
          }
          result += String.fromCharCode.apply(
            null,
            bufView.subarray(i, i + addition)
          );
        }
        // console.log(`Result is: ${result}`);
        return result;
      };
      console.log(`About to fetch PDF data from: ${url}`);
      return fetch(url, {
        credentials: "include",
        responseType: "arraybuffer"
      })
        .then(response => response.arrayBuffer())
        .then(arrayBufferToString);
    },

    /**
     * 
     * @param {string} expression
     * @param {Element} scope
     */
    getElementByXPath(expression, scope = document) {
      const a = document.evaluate(
        expression,
        scope,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      return a.snapshotLength > 0 ? a.snapshotItem(0) : null;
    },

    /**
     * 
     * @param {string} expression
     * @param {Element} scope
     */
    getElementsByXPath(expression, scope = document) {
      const nodes = [];
      const a = document.evaluate(
        expression,
        scope,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      for (let i = 0; i < a.snapshotLength; i += 1) {
        nodes.push(a.snapshotItem(i));
      }
      return nodes;
    },

     /**
     * Given an XPath selector, retrieve all matching nodes text contents
     * @param {string} selector
     * @param {Element} scope
     * @return {Array<*>}
     */
    getElemTexts(selector, scope = document) {
      const elements = this.getElementsByXPath(selector, scope);
      if (!(elements && elements.length)) {
        return [];
      }

       // Replace 'br' nodes with "\n" because node.textContent does delete the line break involved by 'br'
      // eslint-disable-next-line array-callback-return
      elements.map(node => {
        if (node.innerHTML)
          node.innerHTML = node.innerHTML.replace(/<br>/gi, "\n");
      });

       return Array.from(elements)
        .map(el => el.textContent || el.innerText)
        .filter(el => el !== "" && el !== null && el !== undefined)
        .map(el =>
          el
            .replace(/^\s+|^,|[^\S\r\n]+$/gm, "")
            .replace(/[^\S\r\n]+/g, " ")
            .trim()
        );
    },

    /**
     * @param {string} selector
     * @param {string} attribute
     * @param {Element} scope
     */
    getElementsAttributes(selector, attribute, scope = document) {
      const elements = this.getElementsByXPath(selector, scope);
      return elements
        ? Array.from(elements).map(el =>
            el.getAttribute(attribute).replace(/\n/, "")
          )
        : [];
    },

    /**
     * 
     * @param {string|Array<string|*>} query
     * @param {Element} scope
     */
    getDataFromXPath(query, scope) {
      let xpath = query;
      let callbackObjects = {};

       if (Array.isArray(query)) {
        [xpath, callbackObjects] = query;
      }

       const matchres = xpath.match(/(.+)\/@([a-z-_0-9]+)$/i);
      if (!matchres) {
        const texts = this.getElemTexts(xpath, scope);
        return _callbackUtils._apply(texts, callbackObjects);
      }

       const [, _xpath, _attr] = matchres;
      if (!this.getElementByXPath(_xpath, scope)) {
        return "";
      }
      const attributes = this.getElementsAttributes(_xpath, _attr, scope);
      return _callbackUtils._apply(attributes, callbackObjects);
    },

    /**
     * 
     * @param {Object} xpathsMapping
     * @param {Element} scope
     */
    getDataFromMapping(xpathsMapping, scope = document) {
      if (Object.prototype.hasOwnProperty.call(xpathsMapping, "_wrapper_")) {
        const { _wrapper_, ...mapping } = xpathsMapping;
        return this.getElementsByXPath(_wrapper_).map(elem =>
          this.getDataFromMapping(mapping, elem)
        );
      }

       return Object.entries(xpathsMapping).reduce((row, current) => { 
        return {
          ...row,
          [`${current[0]}`]: this.getDataFromXPath(current[1], scope)
        };
      }, {});
    }
  };
};
