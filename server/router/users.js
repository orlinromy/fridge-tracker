const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
/// source: https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
var ObjectId = require("mongodb").ObjectId;

const User = require("../models/User");
const Fridge = require("../models/Fridge");

const fridgeAuth = require("../middleware/fridgeAuth");
// const auth = require("../middleware/auth");
const auth = require("../middleware/auth");

// registration
router.put(
  "/register",
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
router.get("/items", auth, async (req, res) => {
  try {
    const fridges = await Fridge.find({
      $or: [{ admin: req.decoded.id }, { members: req.decoded.id }],
    });
    res.status(200).json({ userId: req.decoded.id, fridges });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create fridge
router.put(
  "/fridge",
  auth,
  [check("fridgeName", "fridge name cannot be empty").notEmpty()],
  async (req, res) => {
    console.log(req.body);
    try {
      const err = validationResult(req);
      console.log(err);
      if (err.errors.length !== 0) {
        return res.status(400).json({ error: 400, message: err.array() });
      }
      const payload = req.body;
      payload.admin = req.decoded.id;

      const createdFridge = await Fridge.create(payload);

      const userIds = [createdFridge.admin, ...createdFridge.members];

      User.find({ _id: { $in: userIds } }, function (err, users) {
        if (err) return res.status(400).json(err);
        for (let user of users) {
          if (user.fridgeId) {
            user.fridgeId = [...user.fridgeId, createdFridge._id];
          } else {
            user.fridgeId = [createdFridge._id];
          }

          user.save();
        }
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
  fridgeAuth,
  async (req, res) => {
    // req.body.email = ['a@n.c', 'b@n.c']

    try {
      const err = validationResult(req);
      if (err.errors.length !== 0) {
        return res.status(400).json({ error: 400, message: err.array() });
      }

      const validUsers = await User.findOne({ email: req.body.email });
      if (!validUsers) {
        return res
          .status(400)
          .json({ erorr: 400, message: "user cannot be found" });
      }
      console.log(validUsers);

      const msg = [];
      User.find({ email: req.body.email }, function (err, users) {
        if (err) return res.status(400).json(err);
        for (let user of users) {
          if (user.fridgeId) {
            if (user.fridgeId.includes(req.body.fridgeId)) {
              msg.push(
                `user ${user._id} is already a member of ${req.body.fridgeId}`
              );
            } else {
              user.fridgeId = [...user.fridgeId, req.body.fridgeId];
            }
          } else {
            user.fridgeId = [req.body.fridgeId];
          }
          user.save();
        }
      });

      // const fridgeIds = [_id.admin, ..._id.members];

      Fridge.find({ _id: req.body.fridgeId }, function (err, fridges) {
        if (err) return res.status(400).json(err);
        for (let fridge of fridges) {
          if (fridge.members) {
            if (fridge.members.includes(validUsers._id)) {
              msg.push(
                `user ${validUsers._id} is already a member of ${req.body.fridgeId}`
              );
            } else {
              fridge.members = [...fridge.members, validUsers._id];
            }
          } else {
            fridge.members = [validUsers._id];
          }

          fridge.save();
        }
      });

      console.log("added user: fridge Id: ", validUsers, msg);
      // console.log("added member: member: ", fridge.members, createdFridge._id);
      res.status(200).json({ validUsers, msg });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

//     validUsers.fridgeId = [...validUsers.fridgeId, req.body.fridgeId];
//     for (let validUser of validUsers) {
//       if (member.fridgeId) {
//         member.fridgeId = [...member.fridgeId, addMember._id];
//       } else {
//         member.fridgeId = [addMember._id];
//       }
//     validUser.save();

//     const addMember = await Fridge.find(payload);

//     addMember.members = [...addMember.members, req.body.members];
//     for (let member of members) {
//       if (member.fridgeId) {
//         member.fridgeId = [...member.fridgeId, addMember._id];
//       } else {
//         member.fridgeId = [addMember._id];
//       }
//     addMember.save();
//   }
// );

// Add items to fridge
router.put(
  "/items",
  [check("items", "fields cannot be empty").notEmpty()],
  auth,
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

// Update items
router.patch("/item", fridgeAuth, async (req, res) => {
  try {
    console.log(req);
    const fridgeItems = await Fridge.findOne({ _id: req.body.fridgeId });
    console.log(req.decoded);
    let isFound = false;

    if (req.decoded.admin) {
      for (const item of fridgeItems.items) {
        const reqItemId = new ObjectId(req.body.itemId);

        if (reqItemId.equals(item._id)) {
          item.expiry = req.body.expiry || item.expiry;
          item.qty = req.body.qty || item.qty;
          item.name = req.body.name || item.name;
          item.owner = req.body.owner || item.owner;
          isFound = true;
        }
      }
      console.log(fridgeItems);
      fridgeItems.save();
    } else {
      for (const item of fridgeItems.items) {
        const reqItemId = new ObjectId(req.body.itemId);
        if (reqItemId.equals(item._id)) {
          if (item.owner === req.decoded.id) {
            item.expiry = req.body.expiry || item.expiry;
            item.qty = req.body.qty || item.qty;
            item.name = req.body.name || item.name;
            item.owner = req.body.owner || item.owner;
            isFound = true;
          } else {
            return res
              .status(403)
              .json({ error: 403, message: "user is not authorized" });
          }
        }
      }
      console.log(fridgeItems);
      fridgeItems.save();
    }
    isFound
      ? res.status(200).json(fridgeItems)
      : res.status(400).json({ error: 400, message: "item not found" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete items
router.delete("/items", fridgeAuth, async (req, res) => {
  try {
    const deleted = await Fridge.deleteOne({ fridgeId: req.body.fridgeId });
    res.status(200).json(deleted);
  } catch (error) {
    res.status(400).json({ error: 400, message: error.message });
  }
});

// Get all items for a particular fridge
router.get("/fridge/:fridgeId", auth, async (req, res) => {
  try {
    const fridge = await Fridge.findOne({ _id: req.params.fridgeId });
    if (
      fridge.admin === req.decoded.id ||
      fridge.members.includes(req.decoded.id)
    ) {
      res.status(200).json(fridge);
    } else {
      res.status(403).json({ error: 403, message: "not authorized" });
    }
  } catch (error) {
    res.status(400).json({ error: 400, message: error.message });
  }
});

module.exports = router;
