const express = require("express");

const collectAction = require(`${process.cwd()}/app/actions/collect`);
const statusAction = require(`${process.cwd()}/app/actions/status`);

module.exports = () => {
  const router = express.Router();

  router.post("/collect", collectAction);
  router.get("/status", statusAction);

  return router;
};
