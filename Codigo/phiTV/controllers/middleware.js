require("dotenv").config();
var express = require("express");
var app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");

/* get config */
const config = require("config");
const baseUrl = config.webServer.baseUrl;
const port = process.env.PORT || "3000";

/* require controllers  */
const { startEventsRoutes } = require("./events/events-controller");
const { startProvidersRoutes } = require("./providers/providers-controller");
const { startLoginRoutes } = require("./login/login-controller");
const { startAdminsRoutes } = require("./admins/admins-controller");
const { startClientsRoutes } = require("./clients/clients-controller");
const { startPurchasesRoutes } = require("./purchases/purchases-controller");
const { startAuthorizationsRoutes } = require("./authorization/authorization-controller");
const { startLogsRoutes } = require("./logs-queue/logs-controller");
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
  await startEventsRoutes(router, services.eventsService);
  await startProvidersRoutes(router, services.providersService);
  await startAdminsRoutes(router, services.adminsService);
  await startLoginRoutes(router, services.loginService);
  await startClientsRoutes(router, services.clientsService);
  await startPurchasesRoutes(router, services.purchasesService);
  await startAuthorizationsRoutes(router, services.authorizationsService);
  await startLogsRoutes(router, services.logsService);

  app.use(baseUrl, router);
  server.listen(port, () => {
    console.log(`[service: middleware] [function: initializeRoutesServer] [tyoe:I] is running on port ${port}`);
  });
};

module.exports = {
  initializeRoutes,
};
