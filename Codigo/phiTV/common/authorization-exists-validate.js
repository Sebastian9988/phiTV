const { ElementInvalidException } = require("../exceptions/exceptions");
const Authorization = require("../data-access/data-access-mongo/Models/Authorizations");

const throwExeptionIfAuthorizationExists = async function (authorization, message) {
	try {
		const authorizationToFind = await Authorization.findOne({ eventName: authorization.eventName });
		if (authorizationToFind) {
			throw new ElementInvalidException(`${message}`);
		}
	} catch (err) {
			console.log('message', message);
			throw new ElementInvalidException(`${message}`);
	}

};

module.exports = {
	throwExeptionIfAuthorizationExists,
};
  