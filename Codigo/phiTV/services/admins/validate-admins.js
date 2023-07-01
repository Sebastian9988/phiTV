const { throwExeptionIfEmptyString } = require("../../common/string-validate");
const { throwExeptionIfUndefined } = require("../../common/object-validate");
const { throwExeptionIfNotHasProperty } = require("../../common/object-validate");
const { throwExeptionIfDateInvalid } = require("../../common/date-validate");
const { toNumberOrExeption } = require("../../common/number-validate");
const { messageBinder } = require("./locale/locale-binder");

const validate = (event) => {
	throwExeptionIfUndefined(event, messageBinder().eventIsMissing);
	throwExeptionIfNotHasProperty(event, "userName", messageBinder().adminUserNameIsMissing);
	throwExeptionIfNotHasProperty(event, "password", messageBinder().adminPasswordIsMissing);

	// throwExeptionIfNotHasProperty(event, "description", messageBinder().descriptionIsMissing);
	// throwExeptionIfEmptyString(event.description, messageBinder().descriptionIsMissing);

	// throwExeptionIfNotHasProperty(event, "date", messageBinder().dateIsMissing);
	// throwExeptionIfDateInvalid(event.date, messageBinder().dateIsMissing);

	// throwExeptionIfNotHasProperty(event, "amount", messageBinder().amountAreMissing);
	// toNumberOrExeption(event.amount, messageBinder().amountAreMissing);
};

module.exports = {
	validate,
};
