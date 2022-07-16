const mongoose = require("mongoose");

const FridgeSchema = new mongoose.Schema(
  {
    fridgeName: { type: String, required: true },
    admin: { type: String, required: true },
    members: [String],
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true, min: 1, default: 1 },
        expiry: {
          type: Date,
          required: true,
          default: () => Date.now() + 14 * 24 * 60 * 60 * 1000,
        },
        owner: { type: String, required: true },
        tag: [String],
        buyDate: { type: Date, default: Date.now() },
      },
    ],
  },

  { timestamps: true },
  { collection: "fridges" }
);

const Fridge = mongoose.model("Fridge", FridgeSchema);

module.exports = Fridge;
