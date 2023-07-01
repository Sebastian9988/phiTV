const mongoose = require("mongoose");

const ProviderPaymentGateway = new mongoose.Schema({
  name: { type: String, default: null },
  hasPaid: { type: Boolean, default: false }
});

module.exports = mongoose.model("ProviderPaymentGateways", ProviderPaymentGateway);
