const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user-controllers");
const { check } = require("express-validator");

router.get("/", userControllers.getUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 3 }),
  ],
  userControllers.signup
);

router.post("/login", userControllers.login);

router.post("/logout", userControllers.logout);

module.exports = router;
