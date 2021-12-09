const User = require("../models/user");

module.exports.getLogin = (req, res) => {
  console.log("login");
  res.render("users/login");
};

module.exports.postLogin = (req, res) => {
  console.log(req.session);
  const redirectUrl = req.session.returnTo || "/campgrounds";
  req.session.returnTo = null;
  req.flash("success", "Welcome back!");
  res.redirect(redirectUrl);
};

module.exports.getRegister = (req, res) => {
  res.render("users/register");
};

module.exports.postRegister = async (req, res) => {
  //Duplicated username error is handled by passport-local-mongoose
  //catchAsync will only redirect to error handler
  //Add try catch here to catch the error and flash messages
  try {
    const { username, email, password } = req.body;
    const user = new User({ email: email, username: username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      //passport login function requirement
      if (err) return next(err);
      req.flash("success", "Successfully Register!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.getLogout = (req, res) => {
  req.logout(); //passport function
  req.flash("success", "You have logged out!");
  res.redirect("/campgrounds");
};
