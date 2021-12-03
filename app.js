const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { urlencoded } = require("express");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const session = require("express-session");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");

const campgroundRoute = require("./routes/campgroundRoute");
const reviewRoute = require("./routes/reviewRoute");

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
app.engine("ejs", ejsMate); //???why add ejsMate
app.set("views", path.join(__dirname, "views")); //set up views to relative path
app.set("campgroundRoute", path.join(__dirname, "campgroundRoute"));
app.set("reviewRoute", path.join(__dirname, "reviewRoute"));
app.use(express.urlencoded({ extended: true })); // use this to parse body
app.use(methodOverride("_method")); //use this to allow put and delete method
app.use(express.static(path.join(__dirname, "public"))); //set public to be served

//Add sessions, need to add it before routes
const sessionConfig = {
  secret: "shouldbesecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    HttpOnly: true,
  },
};
app.use(session(sessionConfig));

//add flash
app.use(flash());
//a middleware to attach success to local variable, and to display flash message with key success
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Add routes
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/review", reviewRoute);

//Meaningless homepage
app.get("/", (req, res) => {
  res.render("home");
});

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
