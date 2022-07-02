const express = require("express");
const User = require("../models/user");
const { body } = require("express-validator");
const authController = require("../controllers/auth");
const Router = express.Router();

Router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("The email is already registered!");
          }
        });
      }),
    body("password").trim().isLength({ min: 4 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

Router.post(
  "/login",
  [
    body("email").trim().isEmail().normalizeEmail(),
    body("password").trim().isLength({ min: 4 }),
  ],
  authController.login
);

module.exports = Router;
