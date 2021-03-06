const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user-controllers");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");

router.get("/", userControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userControllers.signup
);

router.post("/login", userControllers.login);

router.post("/logout", userControllers.logout);

module.exports = router;
