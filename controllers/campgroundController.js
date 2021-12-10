const Campground = require("../models/campground");
module.exports.getAllCampgrounds = async (req, res) => {
  const campgrounds = await Campground.find();
  res.render("campgrounds/index", {
    campgrounds,
  });
};

module.exports.getNewCampground = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.postNewCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  })); //this return an array
  const author = req.user._id;
  campground.author = author;
  await campground.save();
  console.log(campground);
  req.flash("success", "New Campground Created");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.getOneCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campground) {
    req.flash("error", "No Campground Found!");
    return res.redirect("/campgrounds");
  }
  const currentUser = req.user;
  res.render("campgrounds/show", { campground, currentUser });
};

module.exports.getEditCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "No Campground Found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.putEditCampground = async (req, res) => {
  const { id } = req.params; //get the value of id
  console.log(id);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  if (!campground) {
    req.flash("error", "No Campground Found!");
    return res.redirect("/campgrounds");
  }
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs); //this return an array
  await campground.save();
  req.flash("success", "Successfully Edit Campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully Delete Campground!");
  res.redirect("/campgrounds");
};
