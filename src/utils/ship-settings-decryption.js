const crypto = require("crypto");
const _ = require("lodash");

const SETTINGS_SCHEMA = require(`${process.cwd()}/manifest.json`)
  .settingsSchema;

class ShipSettingsDecryption {
  constructor(settings) {
    this.settings = settings;
  }

  decrypt() {
    if (!this.settings.devMode) {
      _.each(this._getEncryptedFieldNames(), fieldName =>
        this.decryptField(fieldName)
      );
    }

    return this.settings;
  }

  decryptField(fieldName) {
    const fieldValue = this.settings[fieldName];

    if (_.isNil(fieldValue)) {
      return;
    }

    const valueParts = fieldValue.split(":");
    const iv = Buffer.from(valueParts.shift(), "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.SETTINGS_ENCRYPTION_KEY),
      iv
    );
    const encryptedValue = Buffer.from(valueParts.join(":"), "hex");
    const decryptedValue = Buffer.concat([
      decipher.update(encryptedValue),
      decipher.final()
    ]);

    this.settings[fieldName] = decryptedValue.toString();
  }

  _getEncryptedFieldNames() {
    return _.map(_.filter(SETTINGS_SCHEMA, ["encrypted", true]), "name");
  }
}

module.exports = ShipSettingsDecryption;
