const { InvalidCredentials } = require("../exceptions/exceptions");

const throwExeptionIfUnauthorizedByRegulityUnity = function (isAuthorizedByRegulityUnity, message) {
	if (!isAuthorizedByRegulityUnity) {
		throw new InvalidCredentials(`${message}`);
	}
};

module.exports = {
	throwExeptionIfUnauthorizedByRegulityUnity,
};
  