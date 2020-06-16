const { check, validationResult } = require("express-validator");

const route = require("express").Router();

route.get("/posts", (req, res) => {
  res.send({
    posts: [
      {
        _id: new Date().toISOString(),
        title: "first post",
        content: "this is the first post",
        imageUrl:
          "https://images.unsplash.com/photo-1484417894907-623942c8ee29?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=889&q=80",
        creator: {
          name: "kevin"
        },
        createdAt: new Date()
      }
    ]
  });
});

route.post(
  "/post",
  check("title").trim().isLength({ min: 5 }),
  check("content").trim().isLength({ min: 5 }),
  (req, res) => {
    const { content, title } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({ message: "Error, Validation failed" });
    }
    res.status(201).send({
      post: {
        _id: new Date().toISOString(),
        content,
        title,
        creator: { name: "kevin" },
        createdAt: new Date()
      }
    });
  }
);

module.exports = route;
