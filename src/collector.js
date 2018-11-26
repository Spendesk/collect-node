const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const authMiddleware = require("./http/middlewares/auth");

const staticRouter = require("./http/routers/static");
const apiRouter = require("./http/routers/api");

class Collector {
  constructor(port) {
    this.port = port;
    this.app = express();
  }

  startApp() {
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    this.app.use("/", staticRouter);
    this.app.use("/api", authMiddleware, apiRouter());

    this.app.listen(this.port);

    return this.app;
  }
}

module.exports = Collector;
