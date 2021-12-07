const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { campgroundSchema } = require("../joiSchemas");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

//Route to campground Index -- campground list
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", {
      campgrounds,
    });
  })
);

//Create campground:route to new campground page, get the form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    const author = req.user._id;
    campground.author = author;
    await campground.save();
    // console.log("log for post new campground");
    // console.log(campground);
    req.flash("success", "New Campground Created");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//Details Page; route to show details page
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate("reviews")
      .populate("author");
    if (!campground) {
      req.flash("error", "No Campground Found!");
      return res.redirect("/campgrounds");
    }
    const currentUser = req.user;
    res.render("campgrounds/show", { campground, currentUser });
  })
);

//Edit campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "No Campground Found!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

//send put request for edit
//We need to check author and user is the same person.
//Although the button is hidden, but still can query this route with postman
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params; //get the value of id
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    if (!campground) {
      req.flash("error", "No Campground Found!");
      return res.redirect("/campgrounds");
    }
    req.flash("success", "Successfully Edit Campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//send delete request
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully Delete Campground!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
