const express = require("express");
const router = express.Router();
const placeControllers = require("../controllers/places-controllers");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");

// Get all places
router.get("/", placeControllers.getPlaces);

// Get place by id
router.get("/:pid", placeControllers.getPlaceById);

// Find places of user
router.get("/user/:uid", placeControllers.getPlacesByUserId);

// Create new place
router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placeControllers.createPlace
);

// Update place
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placeControllers.updatePlace
);

// Delete place
router.delete("/:pid", placeControllers.deletePlace);

module.exports = router;
