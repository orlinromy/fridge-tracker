const jwt = require("jsonwebtoken");

const memberAuth = (req, res, next) => {
  try {
    const token = req.headers["authorization"].replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      if (!decoded.admin) {
        req.decoded = decoded;
        next();
      } else {
        return res.status(403).json({ status: 403, message: "not authorized" });
      }
    } else {
      return res.status(403).json({ status: 403, message: "missing token " });
    }
  } catch (error) {
    return res.status(401).send({ status: "error", message: error.message });
  }
};
module.exports = memberAuth;
