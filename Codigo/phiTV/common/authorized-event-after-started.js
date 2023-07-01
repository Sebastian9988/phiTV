const { InvalidCredentials } = require("../exceptions/exceptions");
const Event = require("../data-access/data-access-mongo/Models/Events");


const thworExeptionIfAuthorizedAfterEventStarted = async function (authorization, message) {
  const event = await Event.findOne({ name: authorization.eventName });
  const startDate = new Date(event.startDate);
  const now = new Date();
	if (now > startDate) {
		throw new InvalidCredentials(`${message}`);
	}
};

module.exports = {
  thworExeptionIfAuthorizedAfterEventStarted,
};
  