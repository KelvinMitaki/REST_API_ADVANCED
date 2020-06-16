const fs = require("fs");
const path = require("path");

const route = require("express").Router();
const { check, validationResult } = require("express-validator");

const Post = require("../models/post");
const isAuth = require("../middlewares/is-auth");
const User = require("../models/user");

route.get("/posts", isAuth, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = 2;
    const totalItems = await Post.countDocuments();
    const posts = await Post.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.send({ posts, totalItems });
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post(
  "/post",
  isAuth,
  check("title").trim().isLength({ min: 5 }),
  check("content").trim().isLength({ min: 5 }),
  async (req, res) => {
    try {
      const { content, title } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).send({ message: "Error, Validation failed" });
      }
      if (!req.file) {
        return res.status(422).send({ message: "no image provided" });
      }
      const post = new Post({
        content,
        title,
        creator: req.userId,
        imageUrl: req.file.path
      });
      const user = await User.findById(req.userId);
      user.posts.push(post._id);
      await user.save();
      const savedPost = await post.save();
      const populatedUser = await savedPost.populate("creator").execPopulate();
      res.status(201).send({
        post: populatedUser
      });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/post/:postId", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ message: "No post found" });
    }
    res.send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.put(
  "/post/:postId",
  isAuth,
  check("title").trim().isLength({ min: 5 }),
  check("content").trim().isLength({ min: 5 }),
  async (req, res) => {
    try {
      const postId = req.params.postId;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).send({ message: "Validation failed" });
      }
      const { content, title } = req.body;
      let imageUrl = req.body.image;
      if (req.file) {
        imageUrl = req.file.path;
      }
      if (!imageUrl) {
        return res.status(422).send({ message: "No file picked" });
      }
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).send({ message: "No post found" });
      }
      if (req.userId !== post.creator.toString()) {
        return res.status(403).send({ message: "Forbidden" });
      }
      if (imageUrl !== post.imageUrl) {
        clearFilePath(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      const updatedPost = await post.save();
      res.send(updatedPost);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.delete("/post/:postId", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ message: "No post found" });
    }
    if (req.userId !== post.creator.toString()) {
      return res.status(403).send({ message: "Forbidden" });
    }
    await Post.findByIdAndDelete(req.params.postId);
    const user = await User.findById(req.userId);
    user.posts.pull(req.params.postId);
    await user.save();
    clearFilePath(post.imageUrl);
    res.send({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

const clearFilePath = filepath => {
  filepath = path.join(__dirname, "..", filepath);
  fs.unlink(filepath, err => err && console.log(err));
};

module.exports = route;
