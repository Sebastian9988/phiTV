const { HttpErrorCodes } = require("../exceptions/exceptions");
const jwt = require('jsonwebtoken');
require("dotenv").config();
// const tokenValidator = require("./token-validator");
// const authenticateToken = async function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader;

//   if (token == null) {
//     return res.sendStatus(HttpErrorCodes.ERROR_401_UNAUTHORIZED);
//   }

//   try {
//     // let verify = tokenValidator.bind();
//     let decode = await verify(token);
//   } catch (err) {
//     return res.sendStatus(HttpErrorCodes.ERROR_403_FORBIDDEN);
//   }
//   next();
// };

const validateToken = async function validateToken(req, res, next) {
  const accessToken = req.header('Authorization');
  if (!accessToken) {
    return res.status(HttpErrorCodes.ERROR_401_UNAUTHORIZED).send('Access denied');
  }

  try {
    const user = jwt.verify(accessToken, process.env.PRIVATE_KEY);
    req.user = user;
    next();
  } catch (err) {
    return res.status(HttpErrorCodes.ERROR_401_UNAUTHORIZED).send('Access denied, token expired or incorrect');
  }
};

module.exports = {
  // authenticateToken,
  validateToken,
};
