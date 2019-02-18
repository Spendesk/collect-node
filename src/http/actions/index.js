const queue = require("../../utils/queue");

const collect = (req, res) => {
  queue.create("collector", {
    clientOptions: req.client,
    captchaSolverOptions: req.captchaSolver,
    ship: req.ship,
    actionKey: "collect"
  }).save();

  res.json({ ok: true });
};

const status = (req, res) => {
  queue.create("collector", {
    clientOptions: req.clientOptions,
    captchaSolverOptions: req.captchaSolverOptions,
    ship: req.ship,
    actionKey: "status"
  }).save();

  res.json({ ok: true });
};

module.exports = {
  collect,
  status
};
