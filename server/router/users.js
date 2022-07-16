const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const Fridge = require("../models/Fridge");

const adminAuth = require("../middleware/adminAuth");
const memberAuth = require("../middleware/memberAuth");

// registration
router.put(
  "/user",
  [
    check("email", "email cannot be empty").notEmpty(),
    check("email", "invalid email").isEmail(),
    check("password", "password cannot be empty").notEmpty(),
    check("password", "invalid password").isAlphanumeric(),
    check("password", "password length is less than 12 characters").custom(
      (value, { req }) => req.body.password.length >= 12
    ),
  ],
  async (req, res) => {
    try {
      const err = validationResult(req);
      console.log(err);
      if (err.errors.length !== 0) {
        return res.status(400).json({ error: 400, message: err.array() });
      }

      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ erorr: 400, message: "duplicate email" });
      }

      const hash = await bcrypt.hash(req.body.password, 12);

      const createdUser = await User.create({
        email: req.body.email,
        hash,
        joinDate: Date.now(),
      });
      console.log("created user: email: ", createdUser.email, createdUser._id);
      res.status(200).json({ status: 200, message: "successfully added" });
    } catch (error) {
      res.status(400).json({ status: "error 400", message: error.message });
    }
  }
);

// what to do in log in
// check if the login input are all ok
// check if the user has been registered
// check if the user's password matches the hash
// create a jwt token if the user has successfully logged in
router.post(
  "/login",
  [
    check("email", "email can't be blank").notEmpty(),
    check("email", "invalid email").isEmail(),
    check("password", "password can't be blank").notEmpty(),
  ],
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (err.errors.length !== 0) {
        return res.status(400).json({ error: 400, message: err.array() });
      }

      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res
          .status(400)
          .json({ status: 400, message: "user is not found" });
      }

      const result = await bcrypt.compare(req.body.password, user.hash);

      if (!result) {
        return res
          .status(401)
          .json({ status: 401, message: "email or password error" });
      }

      const payload = {
        id: user._id,
        email: user.email,
        // admin: user.admin,
      };

      const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
        expiresIn: "20m",
        jwtid: uuidv4(),
      });
      const refresh = jwt.sign(payload, process.env.REFRESH_SECRET, {
        expiresIn: "30d",
        jwtid: uuidv4(),
      });

      const response = { access, refresh };

      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ error: 400, message: error.message });
    }
  }
);

// Get all fridge items
router.get("/items", async (req, res) => {
  try {
    const users = await Fridge.find().select("items");
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create fridge
router.put(
  "/fridge",
  [check("fridgeName", "fridge name cannot be empty").notEmpty()],
  async (req, res) => {
    try {
      const err = validationResult(req);
      console.log(err);
      if (err.errors.length !== 0) {
        return res.status(400).json({ error: 400, message: err.array() });
      }

      const createdFridge = await Fridge.create({
        fridgeName: req.body.fridgeName,
        createDate: Date.now(),
      });
      console.log("created fridge: ", createdFridge.email, createdFridge._id);
      res.status(200).json({ status: 200, message: "successfully added" });
    } catch (error) {
      res.status(400).json({ status: "error 400", message: error.message });
    }
  }
);

// Add member to the fridge
router.patch(
  "/member",
  [check("email", "user email cannot be empty").notEmpty()],
  adminAuth,
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (err.errors.length !== 0) {
        return res.status(400).json({ error: 400, message: err.array() });
      }

      const validUser = await User.findOne({ email: req.body.email });
      if (!validUser) {
        return res
          .status(400)
          .json({ erorr: 400, message: "user cannot be found" });
      }

      validUser.fridgeId = req.body.fridgeId || validUser.fridgeId;
      validUser.save();

      console.log("added user: email: ", validUser.email, validUser._id);
      res.status(200).json(validUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Add items to fridge
router.put(
  "/items",
  [check("items", "fields cannot be empty").notEmpty()],
  memberAuth,
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (err.errors.length !== 0) {
        return res.status(400).json({ error: 400, message: err.array() });
      }

      const addItems = await Fridge.findOne({ email: req.body.fridgeId });
      addItems.items = req.body.items || validUser.items;
      addItems.save();

      res.status(200).json(addItems);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update items for Admin
router.patch("/admin-items", adminAuth, async (req, res) => {
  try {
    const itemUpdate = await Fridge.findOne({ fridgeId: req.body.fridgeId });
    itemUpdate.items = req.body.items || itemUpdate.items;
    itemUpdate.save();

    res.status(200).json(itemUpdate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update items for Members
router.patch("/member-items", memberAuth, async (req, res) => {
  try {
    const itemUpdate = await Fridge.findOne({ fridgeId: req.body.fridgeId });
    itemUpdate.items = req.body.items || itemUpdate.items;
    itemUpdate.save();

    res.status(200).json(itemUpdate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete items for Admin
router.delete("/admin-items", adminAuth, async (req, res) => {
  try {
    const deleted = await Fridge.deleteOne({ fridgeId: req.body.fridgeId });
    res.status(200).json(deleted);
  } catch (error) {
    res.status(400).json({ error: 400, message: error.message });
  }
});

// Delete items for Members
router.delete("/admin-items", memberAuth, async (req, res) => {
  try {
    const deleted = await Fridge.deleteOne({ fridgeId: req.body.fridgeId });
    res.status(200).json(deleted);
  } catch (error) {
    res.status(400).json({ error: 400, message: error.message });
  }
});

module.exports = router;
