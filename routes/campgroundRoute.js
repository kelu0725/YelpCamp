const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const campgroundController = require("../controllers/campgroundController");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

//Route to campground Index -- campground list
router
  .route("/")
  .get(catchAsync(campgroundController.getAllCampgrounds)) //get all campgrounds
  .post(
    //add new campground
    isLoggedIn,
    upload.array("campground[image]"),
    validateCampground,
    catchAsync(campgroundController.postNewCampground)
  );

//Create campground:route to new campground page, get the form
router.get("/new", isLoggedIn, campgroundController.getNewCampground);

//Details Page; route to show details page
router
  .get("/:id", catchAsync(campgroundController.getOneCampground)) //show details
  .put(
    //submit/post edit
    "/:id",
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgroundController.putEditCampground)
  )
  .delete(
    //delete the campground
    "/:id",
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.deleteCampground)
  );

//Edit campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundController.getEditCampground)
);

module.exports = router;
