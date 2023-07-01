const mongoose = require("mongoose");

const Authorization = new mongoose.Schema({
  providerName: { type: String, default: null },
  eventName: { type: String, default: null },
  providerMail: { type: String, default: null },
  providerId: { type: String, default: null },
  url: { type: String, default: null },
  automaticAuthorization: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Authorizations", Authorization);
