const jwt = require("jsonwebtoken");
const Fridge = require("../models/Fridge");

const fridgeAuth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

      const targetFridge = req.body.fridgeId;

      const fridgeAdmin = await Fridge.findOne({ _id: targetFridge }).select(
        "admin members"
      );
      console.log(fridgeAdmin);

      if (fridgeAdmin.length === 0) {
        console.log("fridge can't be found");
        return res
          .status(400)
          .json({ status: 400, message: "couldn't find fridge" });
      }

      if (decoded.id === fridgeAdmin.admin) {
        console.log("is admin");
        req.decoded = decoded;
        req.decoded.admin = true;
        console.log(decoded);
        next();
      } else if (fridgeAdmin.members.includes(decoded.id)) {
        console.log("is not admin");
        req.decoded = decoded;
        req.decoded.admin = false;
        console.log(decoded);
        next();
      } else {
        return res.status(403).json({ status: 403, message: "not authorized" });
      }
    } else {
      return res.status(403).json({ status: 403, message: "missing token" });
    }
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

module.exports = fridgeAuth;
