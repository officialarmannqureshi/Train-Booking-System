const express = require("express");
const router = express.Router();
const path = require("path");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), 'api-docs.html'));
});

module.exports = router;
