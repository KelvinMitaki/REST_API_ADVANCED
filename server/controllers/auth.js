const route = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const User = require("../models/user");

route.post(
  "/signup",
  check("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password length must not be less than six characters"),
  check("name")
    .trim()
    .isLength({ min: 4 })
    .withMessage("name must be at least four characters"),
  async (req, res) => {
    try {
      const { name, email, password, status } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(401)
          .send({ message: "validation failed", errors: errors.array() });
      }
      const user = await User.findOne({ email });
      if (user) {
        return res.status(406).send({ message: "The email already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
        name,
        email,
        status,
        password: hashedPassword
      });
      const newUserSaved = await newUser.save();
      res.status(201).send({
        message: "User successfully created",
        userId: newUserSaved._id
      });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "No user with that email found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "password do not match" });
    }
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );
    res.send({ token, userId: user._id });
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = route;
