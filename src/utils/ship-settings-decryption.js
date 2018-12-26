const crypto = require("crypto");
const _ = require("lodash");

const SETTINGS_SCHEMA = require(`${process.cwd()}/manifest.json`).settingsSchema;
const IV_LENGTH = 16;

class ShipSettingsDecryption {
  constructor(settings) {
    this.settings = settings;
  }

  decrypt() {
    if (!this.settings.dev_mode) {
      _.each(this._getEncryptedFieldNames(), this.decryptField);
    }

    return this.settings;
  }

  decryptField(fieldName) {
    const fieldValue = this.settings[fieldName];

    if (_.isNil(fieldValue)) {
      return;
    }

    const valueParts = fieldValue.split(":");
    const iv = new Buffer(valueParts.shift(), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", new Buffer(process.env.SETTINGS_ENCRYPTION_KEY), iv);
    const decryptedValue = Buffer.concat([
      decipher.update(new Buffer(fieldValue, "hex")),
      decipher.final()
    ]);

    this.settings[fieldName] = decryptedValue.toString();
  }

  _getEncryptedFieldNames() {
    return _.map(_.filter(SETTINGS_SCHEMA, ["encrypted", true]), "name");
  }
}

module.exports = ShipSettingsEncryption;  
