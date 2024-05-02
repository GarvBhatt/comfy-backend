const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = mongoose.model("users");

module.exports.login = (req, res, next) => {
  let token;
  // Check if admin
  if (
    req.body.email === "kunalsoniwert@gmail.com" &&
    req.body.password === "1234Garv1@1"
    ) {
      token = jwt.sign(
        {
          email: "kunalsoniwert@gmail.com",
          role: "admin",
        },
        "gW3UeTC7VeZp7MS2yvGzgRp6m9EgSYGnJQf2q6mLnMtbDvBBrpJqEpxb25vDwT6",
        { expiresIn: "6h" }
        );
        res.status(200).json({ data: "ok", token });
      } else {
    // Check if user
    User.findOne({ email: req.body.email })
    .then((userObj) => {
      if (userObj === null) {
        throw new Error("not authenticated");
      }
      let result = bcrypt.compareSync(req.body.password, userObj.password);
      if (!result) {
        throw new Error("not authenticated");
      }
      token = jwt.sign(
        {
          email: req.body.email,
          id: userObj._id,
          role: "user",
        },
        "gW3UeTC7VeZp7MS2yvGzgRp6m9EgSYGnJQf2q6mLnMtbDvBBrpJqEpxb25vDwT6",
        { expiresIn: "6h" }
        );
        res.status(200).json({ data: "ok", token });
      })
      .catch((error) => next(error));
  }
};
