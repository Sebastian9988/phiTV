require("dotenv").config();
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const { ElementAlreadyExist } = require("../../exceptions/exceptions.js");
const { ElementInvalidException } = require("../../exceptions/exceptions.js");
const { messageBinder } = require("./locale/locale-binder.js");
const { DtoResponse } = require("../../dto/dto-response.js");
const { validate } = require("./validate-purchases.js");
const { pepareFilters } = require("./prepare-filters.js");
const Purchase = require("../../data-access/data-access-mongo/Models/Purchases.js");
const Event = require("../../data-access/data-access-mongo/Models/Events.js");
const Provider = require("../../data-access/data-access-mongo/Models/Providers.js");
const axios = require('axios');

const createPurchase = async function (clientId, aEventId) {
	if (!aEventId) {
		throw new ElementInvalidException(messageBinder().eventIdIsMissing);
	}
	let event = await Event.findOne({ _id: aEventId });
	if (!event) {
		throw new ElementNotFoundException(messageBinder().notFoundEvent);
	}
	if (!event.authorized) {
		throw new ElementNotFoundException(messageBinder().notAuthorizedEvent);
	}
	let provider = await Provider.findOne({_id: event.providerId});
	if (!provider) {
		throw new ElementNotFoundException(messageBinder().notFoundProvider);
	}
	let purchaseExists = await Purchase.findOne({eventId: event._id});
	if (purchaseExists) {
		throw new ElementAlreadyExist(messageBinder().alreadyExistPurchase);
	}
	let providerFromPaymentGateway = await axios.get(`http://localhost:5000/api/providerPaymentGatewaysByName/${provider.name}`);
	if (!providerFromPaymentGateway?.data?.hasPaid) {
		throw new ElementInvalidException(messageBinder().hasNotPaidToPaymentGateway);
	}
	let purchase = new Purchase();
	purchase.price = provider.price;
	purchase.date = new Date();
	purchase.eventId = aEventId;
	purchase.providerId = event.providerId;
	purchase.clientId = clientId;
	let newPurchase = await purchase.save();
	return newPurchase;
};

const getAllPurchases = async function (requestFilter) {
	let filter = pepareFilters(requestFilter);

	let purchases = await Purchase.find(filter.where).skip(filter.skip).limit(filter.limit);
	if (!purchases) {
		throw new ElementNotFoundException(messageBinder().notFoundPurchases);
	}
	let response = new DtoResponse();
	response.data = purchases;
	response.count = await Purchase.count(filter);
	return response;
};


const removePurchase = async function (id) {
	let purchaseToRemove = await Purchase.findOne({ _id: id });
	if (!purchaseToRemove) {
		throw new ElementNotFoundException(messageBinder().notFoundPurchases);
	}
	let filter = { _id: id };
	await Purchase.findByIdAndDelete(filter);
	return;
};

module.exports = {
	removePurchase,
	getAllPurchases,
	createPurchase,
};
