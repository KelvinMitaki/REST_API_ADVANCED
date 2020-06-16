const express = require("express");
const bodyParser = require("body-parser");

const feedRoutes = require("./controllers/feed");

const app = express();

app.use(bodyParser.json());

app.use(feedRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
