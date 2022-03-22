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
  res.json({ place });
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
  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      httpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new Place({
    title,
    description,
    image:
      "data:image/jpeg;base64,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",
    location: coordinates,
    address,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
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

  if (!place) {
    const error = httpError("Could not get place of this id", 404);
    return next(error);
  }

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

  res.status(200).json({ message: `Place with id ${placeId} deleted` });
};

exports.getPlaces = getPlaces;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
