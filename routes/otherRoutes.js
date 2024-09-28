const express = require("express");
const router = express.Router();
const path = require("path");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, (req, res) => {
  res.sendFile(path.join(process.cwd(), "home.html"));
});

module.exports = router;
