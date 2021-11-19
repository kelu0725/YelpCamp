const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random1 = Math.floor(Math.random() * 1000);
    const price1 = Math.floor(Math.random() * 20) + 5;
    const camp = new Campground({
      location: `${cities[random1].city}, ${cities[random1].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/1127092",
      description: "So pretty cute wonderful",
      price: price1,
    });

    await camp.save();
  }
};

seedDB().then(() => mongoose.connection.close());
