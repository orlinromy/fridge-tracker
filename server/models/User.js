const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    hash: { type: String, required: true },
    fridgeId: [String],
  },

  { timestamps: true },
  { collection: "fridgeUsers" }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
