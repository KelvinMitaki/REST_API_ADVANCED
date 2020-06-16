const { check, validationResult } = require("express-validator");
const Post = require("../models/post");

const route = require("express").Router();

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
      const post = new Post({
        content,
        title,
        creator: { name: "kevin" },
        imageUrl:
          "https://images.unsplash.com/photo-1484417894907-623942c8ee29?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=889&q=80"
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
    res.send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = route;
