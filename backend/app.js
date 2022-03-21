const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const httpError = require("./models/http-error");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

//Can only be reached if no res on the upper middleware executed
app.use((req, res, next) => {
  throw httpError("Cannot find the specific path", 404); //This will run the error code below
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
});
app.listen(3000);
