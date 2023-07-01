const { initializeRoutes } = require("./controllers/middleware");

const providerPaymentGatewaysService = require("./services/providerPaymentGateways/ProviderPaymentGateways-service");

const { initializeMongoDB } = require("./data-access/data-access-mongo/connect-mongodb");

const main = async function () {

  /* mongo services  */
  let mongoDbModels = await initializeMongoDB();

  let serviceService = {
    providerPaymentGatewaysService: providerPaymentGatewaysService,
  };

  await initializeRoutes(serviceService);
};

main();
