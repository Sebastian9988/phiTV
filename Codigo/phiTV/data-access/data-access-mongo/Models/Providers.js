const mongoose = require("mongoose");

const Provider = new mongoose.Schema({
  name: { type: String, default: null },
  description: { type: String, default: null },
  mail: { type: String, default: null },
  country: { type: String, default: null },
  city: { type: String, default: null },
  phone: { type: String, default: null },
  currencyCode: { type: String, default: null },  
  currencyName: { type: String, default: null },
  currencySymbol: { type: String, default: null },
  price: { type: Number, default: 0 },
  password: { type: String, default: null },
  userType: { type: String, default: null },
});

module.exports = mongoose.model("Providers", Provider);