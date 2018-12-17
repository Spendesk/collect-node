![npm version](https://badge.fury.io/js/spendesk-collect.svg)

# Spendesk Collect Node

## Installation

```
yarn add spendesk-collect
```

## Spendesk Collect Collector

```javascript
const collector = new SpendeskCollect.Collector(8080);
collector.startApp();
```

The collector module launches automatically an express server instance and exposes the routes needed to develop a collector.

- `api/status`: returns if ship settings are valids or not
- `api/collect`: called to extract invoices from a supplier
- `description`: redirects to `./DESCRIPTION.md`, collector description
- `manifest`: redirects to `./manifest.json`
- `assets/*`: redirects to `./assets` that contains the list of assets needed like picture and artworks.

context is inialized for `status` and `collect` actions.

```javascript
module.exports = async (req, res) => {
  const client = req.client; // SpendeskCollect.Client instance
  const ship = req.ship; //Ship information { settings, lastCollectedAt }
}
```

## Spendesk Collect Client

```javascript
const client = new SpendeskCollect.Client("SHIP_TOKEN");
```

This Client API allows to connect with the Spendesk Collect infrastructure. Here the list of methods available: 

- `done(hasError)`: needs to be called at the end of the `collect` action
- `status(label, message)`: needs to be called for the signin
- `invoices.create(file, identifier, dueAt, options)`: uploads a new invoice
  - `file` needs a path or a buffer
  - `indentifier` needs to be unique
  - `dueAt` is the invoice due date, 
  - `options` is optional if `file` is a path otherwise it needs to follow this pattern: `{ contentType, filename }`
- `logger`: winston logger (`error`, `warn`, `info`, `verbose`, `debug`, `silly`)