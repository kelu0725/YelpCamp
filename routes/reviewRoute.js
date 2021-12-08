const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../joiSchemas");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview } = require("../middleware");

//add a review for a campground
router.post(
  "/",
  validateReview,
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash("success", "Successfully add review!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//delete a review for a campground
router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    const campground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    req.flash("success", "Successfully delete review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
