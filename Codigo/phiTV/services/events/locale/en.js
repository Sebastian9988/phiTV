const crudMessages = {
  notFound: "Event does not exist",
  notFoundEventsApproved: "Not found approved events",
  notFoundClient: "Client does not exist",
  notFoundSubscribedClients: "Not found subscribed clients",
  notFoundAuthorization: "Not found authorization",
  notFoundProvider: "Not found provider",
  alreadyExist: "Already exist event",
  subscriptionAlreadyExist: "Already exist client subscription",
  elementDeleted: "Event deleted",
  amountAreMissing: "Event amount is missing",
  userIdIsMissing: "Event userId is missing",
  categoryIdIsMissing: "Event categoryId is missing",
  eventNameIsMissing: "Event name is missing",
  eventDescriptionIsMissing: "Event description is missing",
  eventStartDateIsMissing: "Event start date is missing",
  eventEndDateIsMissing: "Event end date is missing",
  eventThumbnailImageIsMissing: "Event thumbnail image is missing",
  eventMainImageIsMissing: "Event main image is missing",
  eventCategoryIsMissing: "Event category is missing",
  eventVideoIsMissing: "Event video is missing",
  eventPublishDateIsMissing: "Event publish date is missing",
  eventNotificationDateIsMissing: "Event notifications date is missing",
  dateIsMissing: "Event date is missing",
  eventDateFormatInvalid: "The date must have this format: dd/mm/yyyy",
  eventEndDateIsAfterStartDate: "Start date is after end date",
  eventProviderIdIsMissing: "Event providerId is missing",
  eventAlreadyAuthorized: "It is not allowed to update an event authorized",
  unauthorizedEventSubscription: "It is not allowed to subscribe to a unauthorized event"
};

module.exports = {
  crudMessages,
};
