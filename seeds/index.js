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

  for (let i = 0; i < 10; i++) {
    const random1 = Math.floor(Math.random() * 1000);
    const price1 = Math.floor(Math.random() * 20) + 5;
    const camp = new Campground({
      location: `${cities[random1].city}, ${cities[random1].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://cdn.britannica.com/58/94458-050-0C18D00E/Yosemite-National-Park-California.jpg",
          filename: "sample1",
        },
      ],
      description:
        "Fifteen years after his death, a carousel barker is granted permission to return to Earth for one day to make amends to his widow and their daughter..So pretty cute wonderfulA carousel roundabout (British English), hurdy-gurdy (Australian English, esp. SA), or merry-go-round, is a type of amusement ride consisting of a rotating",
      price: price1,
      author: "61aeb83def766aa4380cb175",
    });

    await camp.save();
  }
};

seedDB().then(() => mongoose.connection.close());
