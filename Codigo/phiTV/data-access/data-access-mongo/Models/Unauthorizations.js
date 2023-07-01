const mongoose = require("mongoose");

const Unauthorization = new mongoose.Schema({
  providerName: { type: String, default: null },
  providerMail: { type: String, default: null },
  eventName: { type: String, default: null },
  reason: { type: String, default: null },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Unauthorizations", Unauthorization);
