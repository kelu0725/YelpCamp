const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const userController = require("../controllers/userController");

router
  .get("/register", userController.getRegister)
  .post("/register", catchAsync(userController.postRegister));

router.get("/login", userController.getLogin).post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  userController.postLogin //middleware function handles failure messages
);

router.get("/logout", userController.getLogout);

module.exports = router;
