const mongoose = require("mongoose");

const Log = new mongoose.Schema({
  providerId: {type: String, default: 0},
  typeOfEntry: { type: String, default: null },
  dateOfEntry: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", Log);
