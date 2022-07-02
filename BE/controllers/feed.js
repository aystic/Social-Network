const Post = require("../models/posts");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const socket = require("../utils/socket");

exports.getPosts = (req, res, next) => {
  const ITEMS_PER_PAGE = 3;
  const page = (req.query.page && +req.query.page) || 1;
  let totalItems;
  Post.countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .sort({ updatedAt: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((data) => {
      res.status(200).json({
        messgae: "Posts fetched succussfully!",
        posts: data,
        totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errList = validationResult(req);
  if (!errList.isEmpty()) {
    const err = new Error("Validation failed!");
    err.body = errList.array();
    err.statusCode = 422;
    throw err;
  }
  if (!req.file) {
    const err = new Error("Image not provided!");
    err.statusCode = 422;
    throw err;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title,
    content,
    imageUrl,
  });
  let response;
  let creator;
  User.findById(req.userId)
    .then((user) => {
      creator = user;
      post.creator.userId = user._id;
      post.creator.name = user.name;
      return post.save();
    })
    .then((result) => {
      response = result;
      creator.posts.push(result._id);
      return creator.save();
    })
    .then((result) => {
      const io = socket.getIO();
      io.emit("post", { action: "create", post });
      res.status(201).json({
        message: "Post created successfully!",
        post: response,
        creator: { id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const id = req.params.postID;
  Post.findById(id)
    .then((post) => {
      if (!post) {
        const err = new Error("Could not find the post!");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.editPost = (req, res, next) => {
  const postID = req.params.postID;
  User.findById(req.userId)
    .then((user) => {
      const isPost = user.posts.find((id) => id.toString() === postID);
      if (!isPost) {
        const error = new Error("Unauthorized!");
        error.statusCode = 403;
        throw error;
      } else {
        const errList = validationResult(req);
        if (!errList.isEmpty()) {
          const err = new Error("Validation failed!");
          err.body = errList.array();
          err.statusCode = 422;
          throw err;
        }
        const title = req.body.title;
        const content = req.body.content;
        let imageUrl;
        if (req.file) {
          imageUrl = req.file.path;
        }
        Post.findById(postID)
          .then((post) => {
            if (!post) {
              const err = new Error("Could not find the post!");
              err.statusCode = 404;
              throw err;
            }
            //check if the post belongs to the currently loggedin user
            if (imageUrl) {
              clearImage(post.imageUrl);
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl || post.imageUrl;
            return post.save();
          })
          .then((result) => {
            console.log(result);
            const io = socket.getIO();
            io.emit("post", { action: "update", post: result });
            res
              .status(200)
              .json({ message: "Post updated succesfully!", post: result });
          });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  // .catch((err) => {
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // });
};

exports.deletePost = (req, res, next) => {
  const postID = req.params.postID;
  User.findById(req.userId)
    .then((user) => {
      const isPost = user.posts.find((id) => id.toString() === postID);
      if (!isPost) {
        const error = new Error("Unauthorized!");
        error.statusCode = 403;
        throw error;
      } else {
        Post.findById(postID)
          .then((post) => {
            if (!post) {
              const err = new Error("Could not find the post!");
              err.statusCode = 404;
              throw err;
            }
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postID);
          })
          .then((result) => {
            return User.findById(req.userId);
          })
          .then((user) => {
            user.posts.pull(postID);
            return user.save();
          })
          .then((result) => {
            console.log(result);
            const io = socket.getIO();
            io.emit("post", { action: "delete" });
            res.status(200).json({ message: "Post deleted successfully!" });
          });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  // .catch((err) => {
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // });
};

const clearImage = (filePath) => {
  fs.unlink(path.join(__dirname, "..", filePath), (err) => {
    if (err) {
      console.log(err);
      // err.statusCode = 500;
      // throw err;
    }
  });
};

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .select("status")
    .then((user) => {
      if (!user) {
        const error = new Error("Falied to fetch status");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "Status fetched successfully!",
        status: user.status,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.setStatus = (req, res, next) => {
  const errList = validationResult(req);
  if (!errList.isEmpty()) {
    const err = new Error("Validation failed!");
    err.body = errList.array();
    err.statusCode = 422;
    throw err;
  }
  const status = req.body.status;
  User.findById(req.userId)
    .then((user) => {
      user.status = status;
      return user.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Status updated successfully!",
        data: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
