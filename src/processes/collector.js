const collectAction = require(`${process.cwd()}/app/actions/collect`);
const statusAction = require(`${process.cwd()}/app/actions/status`);

const Client = require("../client");
const CaptchaSolver = require("../captcha-solver");

const actions = {
  collect: collectAction,
  status: statusAction
};

module.exports = async (job, done) => {
  const { clientOptions, captchaSolverOptions, ship, actionKey }  = job.data;

  const client = new Client(clientOptions.token, clientOptions.devMode);
  const captchaSolver = new CaptchaSolver(captchaSolverOptions.token);

  await actions[actionKey](ship, client, captchaSolver);

  done();
};
