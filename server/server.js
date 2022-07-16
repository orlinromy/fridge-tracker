require("dotenv").config();

const express = require("express");
const connectDB = require("./db/db");
const cors = require("cors");
const users = require("./router/users");

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB(process.env.MONGODB_URI);

app.use("/api/users", users);

app.listen(port, () => {
  console.log("listening on port " + port);
});
