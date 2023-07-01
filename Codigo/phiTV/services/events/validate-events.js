const { throwExeptionIfEmptyString } = require("../../common/string-validate");
const { throwExeptionIfUndefined } = require("../../common/object-validate");
const { throwExeptionIfNotHasProperty } = require("../../common/object-validate");
const { throwExeptionIfDateInvalid, throwExeptionIfEndDateIsAfterStartDate } = require("../../common/date-validate");
const { throwExeptionIfEventIsAlreadyAuthorized } = require("../../common/authorized-event-validate");
const { toNumberOrExeption } = require("../../common/number-validate");
const { messageBinder } = require("./locale/locale-binder");

const messageValidation = (event) => {
	throwExeptionIfUndefined(event, messageBinder().eventIsMissing);
	throwExeptionIfNotHasProperty(event, "name", messageBinder().eventNameIsMissing);
	throwExeptionIfNotHasProperty(event, "description", messageBinder().eventDescriptionIsMissing);
	throwExeptionIfNotHasProperty(event, "startDate", messageBinder().eventStartDateIsMissing);
	throwExeptionIfNotHasProperty(event, "endDate", messageBinder().eventEndDateIsMissing);
	throwExeptionIfNotHasProperty(event, "thumbnailImage", messageBinder().eventThumbnailImageIsMissing);
	throwExeptionIfNotHasProperty(event, "mainImage", messageBinder().eventMainImageIsMissing);
	throwExeptionIfNotHasProperty(event, "category", messageBinder().eventCategoryIsMissing);
	throwExeptionIfNotHasProperty(event, "video", messageBinder().eventVideoIsMissing);
	throwExeptionIfNotHasProperty(event, "publishDate", messageBinder().eventPublishDateIsMissing);
	throwExeptionIfNotHasProperty(event, "notificationsDate", messageBinder().eventNotificationDateIsMissing);
	throwExeptionIfNotHasProperty(event, "providerId", messageBinder().eventProviderIdIsMissing);
}

const consistentDate = (event) => {
	throwExeptionIfDateInvalid(event.startDate, messageBinder().eventDateFormatInvalid);
	throwExeptionIfDateInvalid(event.endDate, messageBinder().eventDateFormatInvalid);
	throwExeptionIfDateInvalid(event.publishDate, messageBinder().eventDateFormatInvalid);
	throwExeptionIfDateInvalid(event.notificationsDate, messageBinder().eventDateFormatInvalid);
	throwExeptionIfEndDateIsAfterStartDate(event.startDate, event.endDate, messageBinder().eventEndDateIsAfterStartDate);
}

const isAuthorized = (event) => {
	throwExeptionIfEventIsAlreadyAuthorized(event.authorized, messageBinder().eventAlreadyAuthorized);
}
 
const validate = (event) => {
	isAuthorized(event);
	messageValidation(event);
	consistentDate(event);
};

module.exports = {
	validate,
};
