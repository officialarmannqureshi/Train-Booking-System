const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const { verifyToken, adminVerify } = require("../middleware/authMiddleware");
const { addTrain } = require("../controllers/adminController");
const {
  getSeatAvailability,
  bookSeat,
} = require("../controllers/userController");

router.post("/register", createUser);
router.get("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/admin/add-train", adminVerify, addTrain);
router.get("/getSeatAvailability", verifyToken, getSeatAvailability);
router.post('/bookSeat',verifyToken, bookSeat);
module.exports = router;
