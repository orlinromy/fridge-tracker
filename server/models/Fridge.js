const mongoose = require("mongoose");

const FridgeSchema = new mongoose.Schema(
  {
    fridgeId: { type: String, required: true, unique: true },
    fridgeName: { type: String, required: true },
    admin: { type: Boolean, required: true },
    members: [String],
    items: [
      {
        itemName: { type: String, required: true },
        qty: { type: Number, required: true, min: 1, default: 1 },
        expiry: {
          type: Date,
          required: true,
          default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
        },
        owner: { type: String, required: true },
        tag: [String],
        buyDate: { type: Date, default: Date.now() },
        createDate: { type: Date, required: true, default: Date.now() },
      },
    ],
  },

  { timestamps: true },
  { collection: "fridgeItems" }
);

const Fridge = mongoose.model("Fridge", FridgeSchema);

module.exports = Fridge;
