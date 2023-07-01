const mongoose = require("mongoose");

const Admin = new mongoose.Schema({
  userName: { type: String, default: null },
  password: { type: String, default: null },
  mail: { type: String, default: null },
  userType: { type: String, default: null },
});

module.exports = mongoose.model("Admins", Admin);
