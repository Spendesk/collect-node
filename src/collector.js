const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const authMiddleware = require("./http/middlewares/auth");

const staticRouter = require("./http/routers/static");
const apiRouter = require("./http/routers/api");

const processes = require("./processes");

class Collector {
  constructor(port, devMode = false) {
    this.port = port;
    this.devMode = devMode;
    this.app = express();
  }

  startApp() {
    processes();

    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    this.app.use("/", staticRouter());
    this.app.use(
      "/api",
      (req, res, next) => {
        req.devMode = this.devMode;

        return next();
      },
      authMiddleware,
      apiRouter()
    );

    this.app.listen(this.port);

    return this.app;
  }
}

module.exports = Collector;
