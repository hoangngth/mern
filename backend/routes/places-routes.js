const express = require("express");

const router = express.Router();

const DUMMY_PLACES = [
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

// Get place by id
router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!place) {
    const error = new Error("Could not find place with such id");
    error.code = 404;
    return next(error);
  }
  res.json({ place });
});

// Find places of user
router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);
  if (places.length === 0) {
    const error = new Error();
    error.code = 404;
    return next(error);
  }
  res.json({ places });
});

module.exports = router;
