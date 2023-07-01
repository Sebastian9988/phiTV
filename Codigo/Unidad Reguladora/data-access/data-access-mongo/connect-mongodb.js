require("dotenv").config();
const mongoose = require("mongoose");
const ProviderRegulatoryUnit = require("./Models/ProviderRegulatoryUnits");

const initializeMongoDB = async function () {
  try {
    let connectionString = process.env.MONGO_CONNECTION_STRING || "";
    mongoose.connect(connectionString);
    console.log(`[initialize: api] [function: initializeModels] [type:I] system init mongodb models}`);
  } catch (err) {
    console.log(`[initialize: api] [function: initializeModels] [type:E] system init monggodb models}`);
  }
  return ProviderRegulatoryUnit;
};

module.exports = {
  initializeMongoDB,
};
