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

module.exports = route;
