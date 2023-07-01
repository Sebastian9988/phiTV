const { initializeRoutes } = require("./controllers/middleware");

const providerRegulatoryUnitsService = require("./services/providerRegulatoryUnits/ProviderRegulatoryUnits-service");

const { initializeMongoDB } = require("./data-access/data-access-mongo/connect-mongodb");

const main = async function () {

  /* mongo services  */
  let mongoDbModels = await initializeMongoDB();

  let serviceService = {
    providerRegulatoryUnitsService: providerRegulatoryUnitsService,
  };

  await initializeRoutes(serviceService);
};

main();
