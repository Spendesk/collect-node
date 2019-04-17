const collectAction = require(`${process.cwd()}/app/actions/collect`);
const authAction = require(`${process.cwd()}/app/actions/auth`);

const browserUtil = require("../utils/browser");

const Client = require("../client");
const CaptchaSolver = require("../captcha-solver");

const ActionError = require("../errors/action");
const AuthActionError = require("../errors/auth-action");

const actions = {
  collect: collectAction,
  auth: authAction
};

module.exports = async (job, done) => {
  const { clientOptions, captchaSolverOptions, ship, actionType } = job.data;

  const browser = await browserUtil(clientOptions.devMode);
  const client = new Client(clientOptions.token, clientOptions.devMode);
  const captchaSolver = new CaptchaSolver(captchaSolverOptions.token);

  try {
    client.logger.info(`${actionType}.start`);

    await actions[actionType](browser, ship, client, captchaSolver);

    client.logger.info(`${actionType}.success`);

    const message =
      actionType === "collect" ? "Invoices fetched" : "Sign in with success";

    await client.done({
      label: "ok",
      type: actionType,
      message
    });
  } catch (e) {
    const type = e instanceof ActionError ? e.type : actionType;
    const message =
      e instanceof ActionError
        ? e.clientMessage
        : "An error occured on our side, we are fixing it";
    const metadata = e instanceof AuthActionError ? e.clientMetadata : {};

    client.logger.error(`${type}.error`, { error: e.message });

    await client.done(
      {
        label: "error",
        type,
        message
      },
      metadata
    );
  }

  await browser.close();

  done();
};
