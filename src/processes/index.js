const _ = require("lodash");

const queue = require("../lib/queue");
const collectorProcess = require("./collector");

const processes = {
  collector: collectorProcess
};

module.exports = () => {
  _.each(processes, (process, processKey) => {
    queue.process(processKey, 1, process);
  });
};
