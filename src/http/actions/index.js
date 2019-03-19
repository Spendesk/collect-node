const queue = require("../../utils/queue");

const collect = (req, res) => {
  queue.create("collector", {
    clientOptions: req.clientOptions,
    captchaSolverOptions: req.captchaSolverOptions,
    ship: req.ship,
    actionType: "collect"
  }).save();

  res.json({ ok: true });
};

const auth = (req, res) => {
  queue.create("collector", {
    clientOptions: req.clientOptions,
    captchaSolverOptions: req.captchaSolverOptions,
    ship: req.ship,
    actionType: "auth"
  }).save();

  res.json({ ok: true });
};

module.exports = {
  collect,
  auth
};
