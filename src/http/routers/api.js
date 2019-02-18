const express = require("express");

const actions = require("../actions");

module.exports = () => {
  const router = express.Router();

  router.post("/collect", actions.collect);
  router.get("/status", actions.status);

  return router;
};
