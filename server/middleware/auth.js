const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.headers["authorization"].replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      req.decoded = decoded;
      next();
    } else {
      return res.status(403).json({ status: 403, message: "missing token" });
    }
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

module.exports = auth;
