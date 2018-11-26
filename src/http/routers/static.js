const express = require("express");

module.exports = () => {
  const router = express.Router();

  router.use(express.static(`${process.cwd()}/assets`));

  router.get("/manifest", (req, res) => {
    res.sendFile(`${process.cwd()}/manifest.json`);
  });

  router.get("/description", (req, res) => {
    res.sendFile(`${process.cwd()}/DESCRIPTION.md`);
  });

  return router;
};
