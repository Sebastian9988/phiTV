const { throwExeptionIfEmptyString } = require("../../common/string-validate");
const { throwExeptionIfUndefined } = require("../../common/object-validate");
const { throwExeptionIfNotHasProperty } = require("../../common/object-validate");
const { throwExeptionIfDateInvalid } = require("../../common/date-validate");
const { toNumberOrExeption } = require("../../common/number-validate");
const { messageBinder } = require("./locale/locale-binder");

const validate = (providerRegulatoryUnit) => {
	// throwExeptionIfUndefined(providerRegulatoryUnit, messageBinder().providerRegulatoryUnitIsMissing);
	// throwExeptionIfNotHasProperty(providerRegulatoryUnit, "category", messageBinder().categoryIdIsMissing);

	// throwExeptionIfNotHasProperty(providerRegulatoryUnit, "description", messageBinder().descriptionIsMissing);
	// throwExeptionIfEmptyString(providerRegulatoryUnit.description, messageBinder().descriptionIsMissing);

	// throwExeptionIfNotHasProperty(providerRegulatoryUnit, "date", messageBinder().dateIsMissing);
	// throwExeptionIfDateInvalid(providerRegulatoryUnit.date, messageBinder().dateIsMissing);

	// throwExeptionIfNotHasProperty(providerRegulatoryUnit, "amount", messageBinder().amountAreMissing);
	// toNumberOrExeption(providerRegulatoryUnit.amount, messageBinder().amountAreMissing);
};

module.exports = {
	validate,
};
