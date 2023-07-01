const mongoose = require("mongoose");

const Query = new mongoose.Schema({
  avaragePurchaseTime: { type: String, default: null },
  maximunNumberOfConcurrentClients: { type: Number, default: null },
  avarageTimeToSeeTransmition: { type: String, default: null },
});

module.exports = mongoose.model("Querys", Query);
