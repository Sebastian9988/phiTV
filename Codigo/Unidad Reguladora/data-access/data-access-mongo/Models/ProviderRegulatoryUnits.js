const mongoose = require("mongoose");

const ProviderRegulatoryUnit = new mongoose.Schema({
  name: { type: String, default: null },
  authorized: { type: Boolean, default: false }
});

module.exports = mongoose.model("ProviderRegulatoryUnits", ProviderRegulatoryUnit);
