if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { urlencoded } = require("express");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

const campgroundRoute = require("./routes/campgroundRoute");
const reviewRoute = require("./routes/reviewRoute");
const userRoute = require("./routes/userRoute");
const dbURL = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

const MongoStore = require('connect-mongo');
//Index.js can be called using node seeds/index.js, to seed data

mongoose.connect(dbURL);
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


//store session into mongo db, mongo-session changes recently
//https://github.com/jdesboeufs/connect-mongo/blob/master/MIGRATION_V4.md

const secret = process.env.SECRET || 'secret';
const mongoStore = MongoStore.create({
  mongoUrl: dbURL,
  secret,
  touchAfter: 24 * 3600,
})

mongoStore.on('error', function(e){
  console.log(e)
})


//Add sessions, need to add it before routes
const sessionConfig = {
  mongoStore,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    HttpOnly: true,
  },
};
app.use(session(sessionConfig));

//add passport authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//add flash
app.use(flash());

//a middleware to add variable to local variable, so that we can access these variables
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
//Welcome homepage
app.get("/index", (req, res) => {
  res.render("campgrounds/home");
});
//Add routes
app.use("/", userRoute);
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/review", reviewRoute);

// app.get("/fakeUser", async (req, res) => {
//   const user = new User({ email: "abcd@gmaili.com", username: "a" });
//   const newUser = await User.register(user, "psw");
//   console.log(newUser);
//   res.send(newUser);
// });

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
