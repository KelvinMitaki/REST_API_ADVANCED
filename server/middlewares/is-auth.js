const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).send({ message: "Not authenticated" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401).send(error);
  }

  if (!decodedToken) {
    return res.status(401).send({ message: "Not authenticated" });
  }
  req.userId = decodedToken.userId;
  next();
};
