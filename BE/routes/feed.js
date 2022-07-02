const express = require("express");
const Router = express.Router();
const feedController = require("../controllers/feed");
const isAuth = require("../middlewares/isAuth");
const { body } = require("express-validator");

Router.get("/posts", isAuth, feedController.getPosts);
Router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedController.createPost
);

Router.get("/post/:postID", isAuth, feedController.getPost);

Router.put(
  "/post/:postID",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedController.editPost
);

Router.delete("/post/:postID", isAuth, feedController.deletePost);

Router.get("/status", isAuth, feedController.getStatus);

Router.put(
  "/status",
  [body("status").trim().isString().not().isEmpty().isLength({ max: 200 })],
  isAuth,
  feedController.setStatus
);

module.exports = Router;
