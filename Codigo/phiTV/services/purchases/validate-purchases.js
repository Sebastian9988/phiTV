//const { throwExeptionIfEmptyString } = require("../string-validate");
const { throwExeptionIfUndefined } = require("../../common/object-validate");
const { throwExeptionIfNotHasProperty } = require("../../common/object-validate");
const { throwExeptionIfDateInvalid } = require("../../common/date-validate");
const { toNumberOrExeption } = require("../../common/number-validate");
const { messageBinder } = require("./locale/locale-binder");

const validate = (client) => {
	throwExeptionIfUndefined(client, messageBinder().clientIsMissing);
	throwExeptionIfNotHasProperty(client, "name", messageBinder().clientNameIsMissing);
	throwExeptionIfNotHasProperty(client, "birthDate", messageBinder().clientBirthDateIsMissing);
	throwExeptionIfNotHasProperty(client, "email", messageBinder().clientEmailIsMissing);
	throwExeptionIfNotHasProperty(client, "country", messageBinder().clientCountryIsMissing);
};

module.exports = {
	validate,
};
