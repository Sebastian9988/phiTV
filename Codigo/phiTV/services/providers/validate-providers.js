const { throwExeptionIfEmptyString } = require("../../common/string-validate");
const { throwExeptionIfUndefined } = require("../../common/object-validate");
const { throwExeptionIfNotHasProperty } = require("../../common/object-validate");
const { throwExeptionIfDateInvalid } = require("../../common/date-validate");
const { toNumberOrExeption } = require("../../common/number-validate");
const { throwExeptionIfInvalidCurrencyCode } = require("../../common/validate-currency");
const { throwExeptionIfInvalidCurrencyName } = require("../../common/validate-currency");
const { throwExeptionIfInvalidCurrencySymbol } = require("../../common/validate-currency");
const { messageBinder } = require("../providers/locale/locale-binder");

const throwExeptionIfSomethingIsWrong = (provider) => {
	throwExeptionIfUndefined(provider, messageBinder().providerIsMissing);
	throwExeptionIfNotHasProperty(provider, "name", messageBinder().providerNameIsMissing);
	throwExeptionIfNotHasProperty(provider, "description", messageBinder().providerDescriptionIsMissing);
	throwExeptionIfNotHasProperty(provider, "mail", messageBinder().providerMailIsMissing);
	throwExeptionIfNotHasProperty(provider, "country", messageBinder().providerCountryIsMissing);
	throwExeptionIfNotHasProperty(provider, "city", messageBinder().providerCityIsMissing);
	throwExeptionIfNotHasProperty(provider, "phone", messageBinder().providerPhoneNumberIsMissing);
	throwExeptionIfNotHasProperty(provider, "currencyCode", messageBinder().providerCurrencyCodeIsMissing);
	throwExeptionIfNotHasProperty(provider, "currencyName", messageBinder().providerCurrencyNameIsMissing);
	throwExeptionIfNotHasProperty(provider, "currencySymbol", messageBinder().providerCurrencySymbolIsMissing);
	throwExeptionIfNotHasProperty(provider, "price", messageBinder().providerPriceIsMissing);
}

function validateCurrency(provider) {
	throwExeptionIfInvalidCurrencyCode(provider, messageBinder().providerInvalidCurrencyCode);
	throwExeptionIfInvalidCurrencyName(provider, messageBinder().providerInvalidCurrencyName);
	throwExeptionIfInvalidCurrencySymbol(provider, messageBinder().providerInvalidCurrencySymbol);
}

const validate = (provider) => {
	throwExeptionIfSomethingIsWrong(provider);
	validateCurrency(provider);
};

module.exports = {
	validate,
};
