const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const feedRoutes = require("./controllers/feed");
const authRoutes = require("./controllers/auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync("./images", { recursive: true });
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${new Date().toISOString().replace(/:/g, "-")}-${file.originalname}`
    );
  }
});

app.use(bodyParser.json());
const sessionStore = new MongoStore({
  mongooseConnection: mongoose.createConnection(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }),
  collection: "seesions"
});
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      sameSite: true
    }
  })
);
app.use(
  multer({
    storage: fileStorage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

const mongooseConnect = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });
  console.log("connected to the database");
};
mongooseConnect();

app.listen(process.env.PORT, () =>
  console.log(`server started on port ${process.env.PORT}`)
);
