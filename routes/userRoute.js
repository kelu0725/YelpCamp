const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res) => {
    //Duplicated username error is handled by passport-local-mongoose
    //catchAsync will only redirect to error handler
    //Add try catch here to catch the error and flash messages
    try {
      const { username, email, password } = req.body;
      const user = new User({ email: email, username: username });
      const registeredUser = await User.register(user, password);
      //   console.log(registeredUser);
      req.flash("success", "Successfully Register!");
    } catch (e) {
      req.flash("error", e.message);
    }
    res.redirect("/register");
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }), //middleware function handles failure messages
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/campgrounds");
  }
);

module.exports = router;
