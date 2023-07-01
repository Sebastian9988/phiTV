const { initializeRoutes } = require("./controllers/middleware");
const providersService = require("./services/providers/providers-service");
const adminsService = require("./services/admins/admins-service");
const loginService = require("./services/login/login-service");
const eventsService = require("./services/events/events-service");
const clientsService = require("./services/clients/clients-service");
const purchasesService = require("./services/purchases/purchases-service");
const authorizationsService = require("./services/authorizations/authorizations-service");
const logsService = require("./services/logs-queue/logs-service")
const { initializeMongoDB } = require("./data-access/data-access-mongo/connect-mongodb");

const main = async function () {
  /* mysql services */

  /* mongo services  */
  let mongoDbModels = await initializeMongoDB();

  let serviceService = {
    eventsService,
    providersService,
    adminsService,
    loginService,
    clientsService,
    authorizationsService,
    purchasesService,
    logsService
  };

  await initializeRoutes(serviceService);
};

main();
