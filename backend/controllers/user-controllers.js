const uuid = require("uuid").v4;
const httpError = require("../models/http-error");
const { validationResult } = require("express-validator");

let DUMMY_USERS = [
  {
    id: "u1",
    name: "roxyfrz",
    email: "roxyfrz@gmail.com",
    password: "123",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const { name, email, password } = req.body;
  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    throw httpError("Cannot create user, email already existed", 422);
  }
  const createdUser = {
    id: uuid(),
    name,
    email,
    password,
  };
  DUMMY_USERS.push(createdUser);
  res.status(200).json({ createdUser: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw httpError("Wrong password or user not exist", 401);
  }
  res.json({ message: "Logged in!" });
};

const logout = (req, res, next) => {};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.logout = logout;
