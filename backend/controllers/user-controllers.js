const httpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = httpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  console.log("hey i clicked it");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      httpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
    console.log("existingUser", existingUser);
  } catch (err) {
    console.log("err", err);
    const error = httpError("Signing up failed, please try again later.", 500);
    return next(error);
  }

  if (existingUser) {
    const error = httpError("User exists already, please login instead.", 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = httpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  res.status(200).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = httpError("Logging in failed, please try again later.", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = httpError("Invalid credentials, could not log you in.", 401);
    return next(error);
  }

  res.json({
    message: "Logged in!",
    user: existingUser.toObject({ getters: true }),
  });
};

const logout = (req, res, next) => {};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.logout = logout;
