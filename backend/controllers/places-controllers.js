const fs = require("fs");

const httpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

const getPlaces = (req, res, next) => {
  res.json({ places: DUMMY_PLACES });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = httpError("Could not find place, please try again.", 500);
    return next(error);
  }

  if (!place) {
    return next(httpError("Could not find place with such id", 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
    //Another way to get places
    //userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = httpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(httpError("Could not find place with such user id", 404));
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      httpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new Place({
    title,
    description,
    image: req.file.path,
    location: coordinates,
    address,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    console.log("err", err);
    const error = httpError("Creating place failed, please try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = httpError("Cannot find user with the specified ID", 404);
    return next(error);
  }

  //Add to MongoDB
  try {
    const session = await mongoose.startSession();
    // <Transaction> <session> </Transaction>
    session.startTransaction();
    await createdPlace.save({ session: session }); //save the newly created place to session
    user.places.push(createdPlace); //only add place id to user.places
    await user.save({ session: session }); //save the newly updated user to session
    await session.commitTransaction();
  } catch (err) {
    console.log("err", err);
    const error = httpError("Creating place failed, please try again.", 500);
    return next(error);
  }

  res.status(200).json({ createdPlace: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      httpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = httpError("Could not find place.", 500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = httpError("You are not allowed to edit this place.", 401);
    return next(error);
  }

  place.title = title;
  place.description = description;
  console.log("place", place, typeof place);

  try {
    await place.save();
  } catch (err) {
    const error = httpError("Could not update place.", 500);
    return next(error);
  }

  res.status(200).json({ message: "Place updated" });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
    console.log("place", place);
  } catch (err) {
    const error = httpError("Could not get place", 500);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = httpError("You are not allowed to delete this place.", 401);
    return next(error);
  }

  if (!place) {
    const error = httpError("Could not get place of this id", 404);
    return next(error);
  }

  const imagePath = place.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = httpError("Could not delete place.", 500);
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: `Place with id ${placeId} deleted` });
};

exports.getPlaces = getPlaces;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
