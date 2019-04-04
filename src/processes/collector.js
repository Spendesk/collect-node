const collectAction = require(`${process.cwd()}/app/actions/collect`);
const authAction = require(`${process.cwd()}/app/actions/auth`);

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

  const client = new Client(clientOptions.token, clientOptions.devMode);
  const captchaSolver = new CaptchaSolver(captchaSolverOptions.token);

  try {
    await actions[actionType](ship, client, captchaSolver);

    client.logger.info(`${actionType}.success`);

    await client.done({
      label: "ok",
      type: actionType,
      message: "Invoices fetched"
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

  done();
};
