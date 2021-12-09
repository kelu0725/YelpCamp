const { campgroundSchema, reviewSchema } = require("./joiSchemas");
const Campground = require("./models/campground");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  // console.log(error);
  if (error) {
    const msg = error.details.map((ele) => ele.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
  }

  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params; //get the value of id
  const campground = await Campground.findById(id);
  if (!req.user || !req.user._id.equals(campground.author)) {
    req.flash("error", "You don't have permission!");
    return res.redirect(`/campgrounds/${campground._id}`);
  }
  next();
};

//Reviews
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  // console.log(error);
  if (error) {
    const msg = error.details.map((ele) => ele.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params; //get the value of id
  const campground = await Campground.findById(id);
  const review = await Review.findById(reviewId);
  if (!req.user || !req.user._id.equals(review.author)) {
    req.flash("error", "You don't have permission!");
    return res.redirect(`/campgrounds/${campground._id}`);
  }
  next();
};
