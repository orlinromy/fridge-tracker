const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    hash: { type: String, required: true },
    fridgeId: [String],
    name: String,
  },

  { timestamps: true },
  { collection: "users" }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
