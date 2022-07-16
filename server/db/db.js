const mongoose = require("mongoose");

const connectDB = async (db) => {
  try {
    await mongoose.connect(db);
    console.log("DB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
