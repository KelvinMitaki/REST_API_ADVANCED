const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRoutes = require("./controllers/feed");

const app = express();

app.use(bodyParser.json());

app.use("/feed", feedRoutes);

const mongooseConnect = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("connected to the database");
};
mongooseConnect();

app.listen(process.env.PORT, () =>
  console.log(`server started on port ${process.env.PORT}`)
);
