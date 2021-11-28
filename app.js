const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { urlencoded } = require("express");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Joi = require("joi");

const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

const { campgroundSchema, reviewSchema } = require("./joiSchemas");
const Campground = require("./models/campground");
const Review = require("./models/review");
//Index.js can be called using node seeds/index.js, to seed data

//Connect to Mongo DB
mongoose.connect("mongodb://localhost:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

//Set up Express App
const app = express();
app.set("view engine", "ejs"); //Add view engine
app.set("views", path.join(__dirname, "views")); //set up views to relative path
app.use(express.urlencoded({ extended: true })); // use this to parse body
app.use(methodOverride("_method")); //use this to allow put and delete method
app.engine("ejs", ejsMate);

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  // console.log(error);
  if (error) {
    const msg = error.details.map((ele) => ele.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  // console.log(error);
  if (error) {
    const msg = error.details.map((ele) => ele.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//Meaningless homepage
app.get("/", (req, res) => {
  res.render("home");
});

//Route to campground Index -- campground list
app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", {
      campgrounds,
    });
  })
);

//route to new campground page, get the form
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//route to show details page
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show", { campground });
  })
);

//route to edie page
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

//send put request for edit
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params; //get the value of id
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//send delete request
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);
//add a review
app.post(
  "/campgrounds/:id/review",
  validateReview,
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//if above routes do no resolve
app.all("*", (req, res, next) => {
  // res.send("404");
  next(new ExpressError("page not found", 404));
});

//error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
