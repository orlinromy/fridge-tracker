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
const { json } = require("express");

// registration
router.put(
  "/register",
  [
    check("name", "name cannot be empty").notEmpty(),
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
        return res
          .status(400)
          .json({ error: 400, message: [{ msg: "user already exists" }] });
      }

      const hash = await bcrypt.hash(req.body.password, 12);

      const createdUser = await User.create({
        email: req.body.email,
        hash,
        name: req.body.name,
      });
      console.log("created user: email: ", createdUser.email, createdUser._id);
      res
        .status(200)
        .json({ status: 200, message: [{ msg: "successfully added" }] });
    } catch (error) {
      res
        .status(400)
        .json({ status: "error 400", message: [{ msg: error.message }] });
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
          .json({ status: 400, message: [{ msg: "user is not found" }] });
      }

      const result = await bcrypt.compare(req.body.password, user.hash);

      if (!result) {
        return res
          .status(401)
          .json({ status: 401, message: [{ msg: "email or password error" }] });
      }

      const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
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
      res.status(400).json({ error: 400, message: [{ msg: error.message }] });
    }
  }
);

// Get all fridge items

router.post("/fridges", auth, async (req, res) => {
  try {
    let fridgeIds = [];
    User.findOne({ _id: req.decoded.id }, "fridgeId", (err, user) => {
      fridgeIds = user.fridgeId;
      Fridge.find(
        {
          _id: { $in: fridgeIds },
        },
        (err, fridge) => {
          if (err) throw Error(err);
          res.status(200).json({
            userId: req.decoded.id,
            userEmail: req.decoded.email,
            userName: req.decoded.name,
            fridge,
          });
        }
      );
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/userId", auth, async (req, res) => {
  console.log(req.body);
});

// Create fridge
router.put(
  "/fridge",
  auth,
  [
    check("fridgeName", "fridge name cannot be empty").notEmpty(),
    check("memberEmails", "members are not in an array").optional().isArray(),
    check("membersEmail.*", "some email is not valid").isEmail(),
    check("items", "items are not in an array").optional().isArray(),
    check("items.*.name", "item name cannot be empty").optional().notEmpty(),
    check("items.*.qty", "quantity is not in numeric").isNumeric(),
    check("items.*.tag", "tag is not in the correct format")
      .optional()
      .isArray(),
    check("items.*.buyDate", "buyDate is not in an array")
      .optional()
      .isISO8601(),
    check("items.*.ownerEmail", "owner email is not valid")
      .optional()
      .isEmail(),
  ],
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
      payload.members = [];
      payload.memberNames = [];

      // get all the emails that need to be searched
      const emails = [...payload.memberEmails];
      for (const item of payload.items) {
        if (!emails.includes(item.ownerEmail)) {
          emails.push(item.ownerEmail);
        }
      }
      const userIdsObj = {};
      const userNameObj = {};
      // get the userid from the emails

      const [users] = await Promise.all([User.find({ email: emails })]);

      console.log(users);

      for (const user of users) {
        userIdsObj[user.email] = user._id;
        userNameObj[user.email] = user.name;
      }

      for (const email of payload.memberEmails) {
        payload.members = [...payload.members, userIdsObj[email]];
        payload.memberNames = [...payload.memberNames, userNameObj[email]];
      }

      payload.items.forEach((item, idx) => {
        item.owner = userIdsObj[item.ownerEmail];
        item.ownerName = userNameObj[item.ownerEmail];
      });

      const [admin] = await Promise.all([
        User.findOne({ _id: req.decoded.id }),
      ]);
      payload.adminEmail = admin.email;
      payload.adminName = admin.name;
      console.log(payload);

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

      res.status(200).json({ status: 200, data: createdFridge });
    } catch (error) {
      console.log(error);
      res.status(400).json({ status: "error 400", message: error.message });
    }
  }
);

// Add member to the fridge
router.patch(
  "/member",
  [
    check("email", "user email cannot be empty").notEmpty(),
    check("email", "User email is not valid").isEmail(),
  ],
  fridgeAuth,
  async (req, res) => {
    console.log(req.body);
    try {
      const err = validationResult(req);
      if (err.errors.length !== 0) {
        return res.status(400).json({ error: 400, message: err.array() });
      }
      if (req.decoded.admin) {
        const validUsers = await User.findOne({ email: req.body.email });
        if (!validUsers) {
          return res
            .status(400)
            .json({ error: 400, message: ["user cannot be found"] });
        }
        console.log(validUsers);

        const [users] = await Promise.all([
          User.find({ email: req.body.email }),
        ]);

        for (let user of users) {
          if (user.fridgeId) {
            if (user.fridgeId.includes(req.body.fridgeId)) {
              console.log("user is already added");
              return res.status(400).json({
                error: 400,
                message: ["this user is already added to the fridge"],
              });
            } else {
              user.fridgeId = [...user.fridgeId, req.body.fridgeId];
            }
          } else {
            user.fridgeId = [req.body.fridgeId];
          }
          user.save();
        }

        // User.find({ email: req.body.email }, function (err, users) {
        //   if (err) return res.status(400).json(err);
        //   for (let user of users) {
        //     if (user.fridgeId) {
        //       if (user.fridgeId.includes(req.body.fridgeId)) {
        //         console.log("user is already added");
        //         return res.status(400).json({
        //           error: 400,
        //           message: "this user is already added to the fridge",
        //         });
        //       } else {
        //         user.fridgeId = [...user.fridgeId, req.body.fridgeId];
        //       }
        //     } else {
        //       user.fridgeId = [req.body.fridgeId];
        //     }
        //     user.save();
        //   }
        // });
        console.log("go through");

        const [fridges] = await Promise.all([
          Fridge.find({ _id: req.body.fridgeId }),
        ]);

        for (let fridge of fridges) {
          if (fridge.members) {
            if (
              fridge.members.includes(validUsers._id) ||
              fridge.admin === validUsers._id
            ) {
              console.log("user is already added");
              return res.status(400).json({
                error: 400,
                message: ["this user is already added to the fridge"],
              });
            } else {
              fridge.members = [...fridge.members, validUsers._id];
              fridge.memberEmails = [...fridge.memberEmails, validUsers.email];
              fridge.memberNames = [...fridge.memberNames, validUsers.name];
            }
          } else {
            fridge.members = [validUsers._id];
            fridge.memberEmails = [validUsers.email];
            fridge.memberNames = [validUsers.name];
          }

          fridge.save();
        }

        // Fridge.find({ _id: req.body.fridgeId }, function (err, fridges) {
        //   console.log("continue");
        //   if (err) return res.status(400).json(err);
        //   for (let fridge of fridges) {
        //     if (fridge.members) {
        //       if (
        //         fridge.members.includes(validUsers._id) ||
        //         fridge.admin === validUsers._id
        //       ) {
        //         console.log("user is already added");
        //         return res.status(400).json({
        //           error: 400,
        //           message: "this user is already added to the fridge",
        //         });
        //       } else {
        //         fridge.members = [...fridge.members, validUsers._id];
        //         fridge.memberEmails = [
        //           ...fridge.memberEmails,
        //           validUsers.email,
        //         ];
        //         fridge.memberNames = [...fridge.memberNames, validUsers.name];
        //       }
        //     } else {
        //       fridge.members = [validUsers._id];
        //       fridge.memberEmails = [validUsers.email];
        //       fridge.memberNames = [validUsers.name];
        //     }

        //     fridge.save();
        //   }
        // });
        res.status(200).json({ message: "member has been successfully added" });
      } else {
        return res
          .status(403)
          .json({ status: 403, message: ["not authorized"] });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: [error.message] });
    }
  }
);

// Add items to fridge
router.put(
  "/items",
  [
    check("fridgeId", "fridgeId needs to be provided").notEmpty(),
    check("items.*.name", "name cannot be empty").notEmpty(),
    check("items.*.qty", "quantity cannot be empty").notEmpty(),
    check("items.*.qty", "quantity is not numeric").isNumeric(),
    check("items.*.expiry", "expiry date cannot be empty").notEmpty(),
    check("items.*.expiry", "expiry date is not in date format").isISO8601(),
    check("items.*.ownerEmail", "owner cannot be empty").notEmpty(),
    check("items.*.tag", "tag is not an array").optional().isArray(),
    check("items.*.buyDate", "buy date is not in date format")
      .optional()
      .isISO8601(),
  ],
  auth,
  async (req, res) => {
    try {
      const err = validationResult(req);
      console.log(err);
      if (err.errors.length !== 0) {
        return res.status(400).json({ error: 400, message: err.array() });
      }

      const fridge = await Fridge.findOne({ _id: req.body.fridgeId });

      const emails = [];
      for (const item of req.body.items) {
        if (!emails.includes(item.ownerEmail)) {
          emails.push(item.ownerEmail);
        }
      }
      const userIdsObj = {};
      const userNameObj = {};
      const [users] = await Promise.all([User.find({ email: emails })]);

      for (const user of users) {
        userIdsObj[user.email] = user._id;
        userNameObj[user.email] = user.name;
      }

      for (const item of req.body.items) {
        item.owner = userIdsObj[item.ownerEmail];
        item.ownerName = userNameObj[item.ownerEmail];
      }
      for (const item of req.body.items) {
        if (
          (fridge.admin === req.decoded.id ||
            fridge.members.includes(req.decoded.id)) &&
          (fridge.admin === item.owner.toString() ||
            fridge.members.includes(item.owner.toString()))
        ) {
          console.log("fridge item: ", fridge.items);
          if (!fridge.items) {
            fridge.items = [item];
          } else {
            fridge.items = [...fridge.items, item];
          }
        }
      }
      fridge.save();
      res.status(200).json(fridge);
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
    console.log(req.body.owner);
    const [user] = await Promise.all([User.findOne({ _id: req.body.owner })]);
    console.log(user);
    const ownerEmail = user.email;
    const ownerName = user.name;
    console.log(ownerEmail);
    console.log(ownerName);

    if (req.decoded.admin) {
      for (const item of fridgeItems.items) {
        const reqItemId = new ObjectId(req.body.itemId);

        if (reqItemId.equals(item._id)) {
          item.expiry = req.body.expiry || item.expiry;
          item.qty = req.body.qty || item.qty;
          item.name = req.body.name || item.name;
          item.owner = req.body.owner || item.owner;
          item.ownerEmail = ownerEmail || item.ownerEmail;
          item.ownerName = ownerName || item.ownerName;
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
            item.ownerName = ownerName || item.ownerName;
            item.ownerEmail = ownerEmail || item.ownerEmail;
            isFound = true;
          } else {
            return res.status(403).json({
              error: 403,
              message: [{ msg: "user is not authorized" }],
            });
          }
        }
      }
      console.log(fridgeItems);
      fridgeItems.save();
    }
    isFound
      ? res.status(200).json(fridgeItems)
      : res
          .status(400)
          .json({ error: 400, message: [{ msg: "item not found" }] });
  } catch (error) {
    res.status(400).json({ message: [{ msg: error.message }] });
  }
});

// new del codes
router.delete("/items", fridgeAuth, async (req, res) => {
  try {
    console.log(req.body);
    Fridge.findOne({ _id: req.body.fridgeId }, (err, fridge) => {
      if (req.decoded.admin) {
        const deleteAdminItems = fridge.items.filter((item) => {
          return item._id.toString() !== req.body.itemId;
        });
        fridge.items = deleteAdminItems;
        console.log(fridge);
        fridge.save();
        res.status(200).json(fridge);
      } else {
        console.log("not admin");

        fridge.items.forEach((item) => {
          if (item._id.toString() === req.body.itemId) {
            if (item.owner !== req.decoded.id) {
              return res.status(403).json({ message: "not authorized" });
            }
          }
        });

        const deleteAdminItems = fridge.items.filter((item) => {
          return item._id.toString() !== req.body.itemId;
        });

        fridge.items = deleteAdminItems;
        fridge.save();
        console.log(fridge);
        res.status(200).json(fridge);
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
      res.status(200).json({
        userId: req.decoded.id,
        userEmail: req.decoded.email,
        userName: req.decoded.name,
        fridge,
      });
    } else {
      res.status(403).json({ error: 403, message: "not authorized" });
    }
  } catch (error) {
    res.status(400).json({ error: 400, message: error.message });
  }
});

module.exports = router;
