const jwt = require("jsonwebtoken");
require("dotenv").config();
const client = require("../config/config");
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["cookie"];
  if (!authHeader) return res.sendStatus(204);

  const cookies = authHeader.split("; ");

  const sessionCookie = cookies.find((cookie) =>
    cookie.startsWith("SessionID=")
  );

  if (!sessionCookie) return res.sendStatus(204);

  const token = sessionCookie.split("=")[1];

  console.log(token);
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Error in logging in!", error: err.message });
      }
      req.user = user;
      console.log(req.user);
      next();
    });
  } else {
    return res.status(401).json({ message: "Invalid public token" });
  }
};

exports.adminVerify = async (req, res, next) => {
  const authHeader = req.headers["cookie"];
  if (!authHeader) return res.sendStatus(204);

  const cookies = authHeader.split("; ");

  const sessionCookie = cookies.find((cookie) =>
    cookie.startsWith("SessionID=")
  );

  if (!sessionCookie) return res.sendStatus(204);

  const token = sessionCookie.split("=")[1];

  // const result = await client.query(`SELECT * FROM admin WHERE admin_token = $1;`, [token]);
  // if (result.rows.length === 1) {
  if (token) {
    jwt.verify(token, process.env.JWT_ADMIN_SECRET_KEY, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "You are not authorized for admin access!" });
      }
      req.user = user;
      console.log(req.user);
      next();
    });
  } else {
    return res.status(401).json({ message: "Invalid admin token" });
  }
  // }
};
