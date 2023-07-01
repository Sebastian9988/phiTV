const { InvalidCredentials } = require("../exceptions/exceptions");

const throwExeptionIfEventIsAlreadyAuthorized = function (authorized, message) {
  if (authorized) {
    throw new InvalidCredentials(message);
  }
};

module.exports = {
  throwExeptionIfEventIsAlreadyAuthorized,
};
