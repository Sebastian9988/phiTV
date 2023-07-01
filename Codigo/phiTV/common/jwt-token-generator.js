require("dotenv").config();

const jwt = require("jsonwebtoken");
const secretKey = process.env.PRIVATE_KEY || "nothing";
const expires = process.env.JWT_EXPIRES || "12h";

const generateJWTUserPermissions = async (user, claims) => {
  let signOptions = {
    expiresIn: expires,
  };
  let token = jwt.sign({ client: user.userId, permissions: claims }, secretKey, signOptions);
  return token;
};

module.exports = {
  generateJWTUserPermissions,
};
