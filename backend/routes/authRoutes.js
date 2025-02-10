const express = require("express");
const { register, login, guestLogin } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/guest-login", guestLogin);

module.exports = router;