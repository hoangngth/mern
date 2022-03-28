const fs = require("fs");
const path = require("path");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const httpError = require("./models/http-error");
const express = require("express");
const bodyParser = require("body-parser");
const mogoose = require("mongoose");
const { default: mongoose } = require("mongoose");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

//Can only be reached if no res on the upper middleware executed
app.use((req, res, next) => {
  throw httpError("Cannot find the specific path", 404); //This will run the error code below
});

//In an async task (e.g. in a promise), you need to use next(error) - throw error will NOT cause the error handling middleware to become active.
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
});

const mongoDbAtlasPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${encodeURIComponent(
  mongoDbAtlasPassword
)}@cluster0.rex8x.mongodb.net/${
  process.env.DB_NAME
}?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => app.listen(5000))
  .catch((error) => console.log("error", error));
