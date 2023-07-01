require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./Models/Events");
const Provider = require("./Models/Providers");
const Admins = require("./Models/Admins");
const Authorizations = require("./Models/Authorizations");
const Unauthorizations = require("./Models/Unauthorizations");
const Client = require("./Models/Clients");
const Log = require("./Models/Log");

const initializeMongoDB = async function () {
  try {
    let connectionString = process.env.MONGO_CONNECTION_STRING || "";
    mongoose.connect(connectionString);
    console.log(`[initialize: api] [function: initializeModels] [type:I] system init mongodb models}`);
  } catch (err) {
    console.log(`[initialize: api] [function: initializeModels] [type:E] system init monggodb models}`);
  }
  return {
    Event,
    Provider,
    Client,
    Admins,
    Authorizations,
    Unauthorizations,
    Log
  };
};

module.exports = {
  initializeMongoDB,
};
