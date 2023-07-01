const { throwExeptionIfEmptyString } = require("../../common/string-validate");
const { throwExeptionIfUndefined } = require("../../common/object-validate");
const { throwExeptionIfNotHasProperty } = require("../../common/object-validate");
const { throwExeptionIfDateInvalid } = require("../../common/date-validate");
const { toNumberOrExeption } = require("../../common/number-validate");
const { messageBinder } = require("./locale/locale-binder");

const validate = (providerPaymentGateway) => {
	// throwExeptionIfUndefined(providerPaymentGateway, messageBinder().providerPaymentGatewayIsMissing);
	// throwExeptionIfNotHasProperty(providerPaymentGateway, "category", messageBinder().categoryIdIsMissing);

	// throwExeptionIfNotHasProperty(providerPaymentGateway, "description", messageBinder().descriptionIsMissing);
	// throwExeptionIfEmptyString(providerPaymentGateway.description, messageBinder().descriptionIsMissing);

	// throwExeptionIfNotHasProperty(providerPaymentGateway, "date", messageBinder().dateIsMissing);
	// throwExeptionIfDateInvalid(providerPaymentGateway.date, messageBinder().dateIsMissing);

	// throwExeptionIfNotHasProperty(providerPaymentGateway, "amount", messageBinder().amountAreMissing);
	// toNumberOrExeption(providerPaymentGateway.amount, messageBinder().amountAreMissing);
};

module.exports = {
	validate,
};
