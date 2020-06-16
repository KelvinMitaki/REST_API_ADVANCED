const fs = require("fs");
const path = require("path");

const route = require("express").Router();
const { check, validationResult } = require("express-validator");

const Post = require("../models/post");

route.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.send({ posts });
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post(
  "/post",
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
        creator: { name: "kevin" },
        imageUrl: req.file.path
      });
      const savedPost = await post.save();
      res.status(201).send({
        post: savedPost
      });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/post/:postId", async (req, res) => {
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

const clearFilePath = filepath => {
  filepath = path.join(__dirname, "..", filepath);
  fs.unlink(filepath, err => err && console.log(err));
};

module.exports = route;
