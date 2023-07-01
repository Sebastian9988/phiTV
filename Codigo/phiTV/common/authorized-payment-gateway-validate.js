const { InvalidCredentials } = require("../exceptions/exceptions");

const throwExeptionIfHasNotPaidToPaymentGateway = function (hasPaid, message) {
	if (!hasPaid) {
		throw new InvalidCredentials(`${message}`);
	}
};

module.exports = {
	throwExeptionIfHasNotPaidToPaymentGateway,
};
  