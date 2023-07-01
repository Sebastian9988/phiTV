const mongoose = require("mongoose");

const Event = new mongoose.Schema({
  name: { type: String, default: null },
  description: { type: String, default: null },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
  thumbnailImage: { type: String, default: null },
  mainImage: { type: String, default: null },
  category: { type: String, default: null },
  video: { type: String, default: null },
  publishDate: { type: Date, default: Date.now },
  notificationsDate: { type: Date, default: Date.now },
  price: { type: String, default: null },
  providerId: { type: String, default: null },
  authorized: { type: Boolean, default: null },
  sentMessages: { type: Number, default: 0 },
  failedMessages: { type: Number, default: 0 },
  subscribedClients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clients",
    },
  ],
});

module.exports = mongoose.model("Events", Event);
