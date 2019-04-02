![npm version](https://badge.fury.io/js/spendesk-collect.svg)

# Spendesk Collect Node

## Installation

```
yarn add spendesk-collect
```

## Spendesk Collect Collector

```javascript
const collector = new SpendeskCollect.Collector(PORT);
collector.startApp();
```

The collector module launches automatically an server instance and exposes what's necessary to develop a collector.

- `auth` action: returns if ship settings are valids or not
- `collect` action: called to extract invoices from a supplier
- `description`: redirects to `./DESCRIPTION.md`, collector description
- `manifest`: redirects to `./manifest.json`
- `assets/*`: redirects to `./assets` that contains the list of assets needed like logo (`logo.png`).

context is inialized for `status` and `collect` actions.

```javascript
module.exports = async (ship, client, captchaSolver) => {
  // client is SpendeskCollect.Client instance
  // ship is an object that contains information { settings, nextCollectAt, currentSettingsStepTag }
  // captchaSolver is a instance of a captcha solver (see below for more information)
}
```

## Spendesk Collect Client

```javascript
const client = new SpendeskCollect.Client("SHIP_TOKEN");
```

This Client API allows to connect with the Spendesk Collect infrastructure. Here the list of methods available: 

- `done(status, metadata)`: returns to broker the status of the ship
  - `status` is an object: `{ label: ok|error, type: auth|collect }`
  - `metadata` is an optional object: `{ currentSettingsStepTag }`
- `invoices.create(file, metadata, fileOptions)`: uploads a new invoice
  - `file` needs a path or a buffer
  - `metadata` is an object that contains invoice metadata. Requested attributes: `identifier`, `dueAt`, `amount`, `currency`
  - `fileOptions` is optional if `file` is a path otherwise it needs to follow this pattern: `{ contentType, filename }`
- `logger`: winston logger (`error`, `warn`, `info`, `verbose`, `debug`, `silly`)


## Spendesk Collect Captcha Solver

```javascript
const captchaSolver = new SpendeskCollect.CaptchaSolver("CAPTCHA_SOLVER_TOKEN");
```

List of methods availables:

- `solveReCaptcha(googlekey, pageurl, proxy, proxytype)`: method to solve google recaptcha
  - `googlekey` corresponds to the captcha key. You can find it in the src of the iframe https://www.google.com/recaptcha/api2/anchor?ar=1&k=GOOGLE_KEY&co=XXX&hl=en&v=VVV&size=normal&cb=YYY
  - `pageurl` corresponds to the website url where the captcha is
  - (optional) `proxy` allows you to add a proxy url if wanted
  - (optional) `proxytype`

