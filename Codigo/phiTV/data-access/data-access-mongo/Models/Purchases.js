const mongoose = require("mongoose");

const Purchase = new mongoose.Schema({
  price: { type: String, default: null },
  date: { type: Date, default: null },
  eventId: { type: String, default: null },
  providerId: { type: String, default: null },
  clientId: { type: String, default: null },
});

module.exports = mongoose.model("Purchases", Purchase);
