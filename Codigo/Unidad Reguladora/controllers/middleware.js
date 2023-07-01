require("dotenv").config();
var express = require("express");
var app = express();
app.use(express.json());
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");

/* get config */
const config = require("config");
const baseUrl = config.webServer.baseUrl;
const port = process.env.PORT || "4000";

/* require controllers  */
const { startProviderRegulatoryUnitsRoutes } = require("./providerRegulatoryUnits/providerRegulatoryUnits-controller");
const tokenValidator = require("./token-validator");

const doCommonFilter = (app) => {
  /*start filtros del middleware*/
  // TODO: aca podrian utilizarse los filters?
  app.use(express.static("public"));
  app.use(express.json());

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "DELETE", "UPDATE", "PUT"],
    })
  );
};

const doCustomFilter = (app) => {
  app.use(tokenValidator.tokenValidator);
};

const initializeRoutes = async function (services) {
  doCommonFilter(app); /*expres filtes for all request*/
  doCustomFilter(app); /*validate token*/

  let router = express.Router();
  await startProviderRegulatoryUnitsRoutes(router, services.providerRegulatoryUnitsService);

  app.use(baseUrl, router);
  server.listen(port, () => {
    console.log(`[service: middleware] [function: initializeRoutesServer] [tyoe:I] is running on port ${port}`);
  });
};

module.exports = {
  initializeRoutes,
};
