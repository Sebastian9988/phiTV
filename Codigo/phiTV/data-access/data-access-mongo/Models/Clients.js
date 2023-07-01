const mongoose = require("mongoose");
const Event = require("./Events.js");
const Provider = require("./Providers.js");
const { INTEGER } = require("sequelize");

const Client = new mongoose.Schema({
  name: { type: String, default: null },
  birthDate: { type: Date, default: Date.now },
  email: { type: String, default: null },
  country: { type: String, default: null },
  userType: { type: String, default: null },
  password: { type: String, default: null },
  eventId: { type: String, default: null },
});

module.exports = mongoose.model("Clients", Client);
