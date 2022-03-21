const uuid = require("uuid").v4;
const httpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const dbClient = require("../db/mongo");
const getCoordsForAddress = require("../util/location");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "Famous in the US",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th, New York, NY 10001",
    creator: "u1",
  },
  {
    id: "p2",
    title: "place 1",
    description: "desc 1",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "addr 1",
    creator: "u2",
  },
  {
    id: "p3",
    title: "place 3",
    description: "desc 3",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "addr 3",
    creator: "u1",
  },
];

const getPlaces = (req, res, next) => {
  res.json({ places: DUMMY_PLACES });
};

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!place) {
    return next(httpError("Could not find place with such id", 404));
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);
  if (places.length === 0) {
    return next(httpError("Could not find place with such user id", 404));
  }
  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new httpError("Invalid inputs passed, please check your data.", 422);
  }

  const { title, description, location, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  DUMMY_PLACES.push(createdPlace);
  console.log("createdPlace", createdPlace);

  try {
    await dbClient.connect();
    const db = dbClient.db();
    const result = await db.collection("places").insertOne(createdPlace);
    console.log("result", result);
  } catch (error) {
    throw httpError(error, 500);
  }
  await dbClient.close();

  res.status(200).json({ createdPlace: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  const updatedPlace = DUMMY_PLACES.find((p) => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;
  DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json({ updatedPlace: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: `place with id ${placeId} deleted` });
};

exports.getPlaces = getPlaces;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
