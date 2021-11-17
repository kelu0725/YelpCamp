const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const { urlencoded } = require("express");
const methodOverride = require("method-override");

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

//Meaningless homepage
app.get("/", (req, res) => {
  res.render("home");
});

//Route to campground Index -- campground list
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find();
  res.render("campgrounds/index", {
    campgrounds,
  });
});

//route to new campground page, get the form
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

app.get("/campgrounds/:id", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { campground });
});

app.get("/campgrounds/:id/edit", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { campground });
});

app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params; //get the value of id
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
});

app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
