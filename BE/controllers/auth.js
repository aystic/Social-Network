const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const user = require("../models/user");

exports.signup = (req, res, next) => {
  const errList = validationResult(req);
  if (!errList.isEmpty()) {
    const err = new Error("Validation failed!");
    err.body = errList.array();
    err.statusCode = 422;
    throw err;
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  bcrypt
    .hash(password, 12)
    .then((hashedPwd) => {
      const user = new User({
        email,
        password: hashedPwd,
        name,
      });
      return user.save();
    })
    .then((result) => {
      console.log(result);
      res
        .status(200)
        .json({ message: "User created successfully!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const errList = validationResult(req);
  if (!errList.isEmpty()) {
    const err = new Error("Validation failed!");
    err.body = errList.array();
    err.statusCode = 422;
    throw err;
  }
  const email = req.body.email;
  const password = req.body.password;
  let currUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const err = new Error("User with given email does not exist!");
        err.statusCode = 401;
        throw err;
      }
      currUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((areEqual) => {
      if (!areEqual) {
        const err = new Error("The password you entered is incorrect!");
        err.statusCode = 401;
        throw err;
      }
      const token = jwt.sign(
        { userId: currUser._id.toString(), userEmail: currUser.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );
      console.log(token);
      res
        .status(200)
        .json({ token, userId: currUser._id, email: currUser.email });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
