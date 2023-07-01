require("dotenv").config();
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const { ElementAlreadyExist } = require("../../exceptions/exceptions.js");
const { messageBinder } = require("./locale/locale-binder.js");
const { DtoResponse } = require("../../dto/dto-response.js");
const { validate } = require("./validate-providers");
const { pepareFilters } = require("./prepare-filters.js");
const Provider = require("../../data-access/data-access-mongo/Models/Providers.js");
const Event = require("../../data-access/data-access-mongo/Models/Events.js");
const Query = require("../../data-access/data-access-mongo/Models/Querys.js");
const { hashing } = require('../../common/encrypt');

const remove = async function (id) {
	let providerToRemove = await Provider.findOne({ _id: id });
	if (!providerToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let filter = { _id: id };
	await Provider.findByIdAndDelete(filter);
	return;
};


const create = async function (aProvider) {
	if (aProvider.name) {
		let providerExists = await Provider.findOne({ name: aProvider.name });
		if (providerExists) {
			throw new ElementAlreadyExist(messageBinder().alreadyExist);
		}
	}
	validate(aProvider);
	let provider = new Provider();
	provider.name = aProvider.name;
	provider.description = aProvider.description;
	provider.mail = aProvider.mail;
	provider.country = aProvider.country;
	provider.phone = aProvider.phone;
	provider.city = aProvider.city;
	provider.currencyCode = aProvider.currencyCode;
	provider.currencyName = aProvider.currencyName;
	provider.currencySymbol = aProvider.currencySymbol;
	provider.password = hashing(aProvider.password);
	provider.userType = aProvider.userType;
	provider.price = aProvider.price;
	let newProvider = await provider.save();
	return newProvider;
};

const update = async function (id, aProvider) {
	let providerForUpdate = await Provider.findOne({ _id: id });
	if (!providerForUpdate) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	validate(aProvider);
	let filter = { _id: id };
	try {
		await Provider.findByIdAndUpdate(filter, aProvider);
	} catch (err) {
		console.log("Un error al actualizar: " + JSON.stringify(err));
	}
	return aProvider;
};

const getAll = async function (requestFilter) {
	let filter = pepareFilters(requestFilter);

	let providers = await Provider.find(filter.where).skip(filter.skip).limit(filter.limit);
	if (!providers) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let response = new DtoResponse();
	response.data = providers;
	response.count = await Provider.count(filter);
	return response;
};


const getEventInformation = ({event, queryInformation}) => {
	const {avaragePurchaseTime, maximunNumberOfConcurrentClients, avarageTimeToSeeTransmition} = queryInformation;
	const subscribedClients = event.subscribedClients.length;
	const sentMessages = event.sentMessages ? event.sentMessages : 0;
	const failedMessages = event.failedMessages ? event.failedMessages : 0;
	
	return {
		eventId: event._id,
		subscribedClients,
		avaragePurchaseTime,
		maximunNumberOfConcurrentClients,
		avarageTimeToSeeTransmition,
		sentMessages,
		failedMessages,
	};
};

const getEventInformationForProvider = async (eventId) => {
	const event = await Event.findOne({ _id: eventId });
	const querys = await Query.find().exec();
	const queryInformation = querys[0];
	return event ? getEventInformation({event, queryInformation}) : {eventInfo: "Not found"} ;
};

const getAllEventsForProviders = async function (id) {
	const events = await Event.find({ providerId: id });
	if (!events) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let approvedEvents = 0;
	let disapprovedEvents = 0;
	const querys = await Query.find().exec();
	const queryInformation = querys[0];
	const eventsInfo = events.map((event) => {
		approvedEvents = event.authorized ? approvedEvents + 1 : 0;
		disapprovedEvents = event.authorized ? disapprovedEvents : disapprovedEvents + 1;
		return getEventInformation({event, queryInformation});
	});
	return {eventsInfo, approvedEvents, disapprovedEvents};
};

const get = async function (id) {
	let aProvider = await Provider.findOne({ _id: id });
	if (!aProvider) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	return aProvider;
};

module.exports = {
	remove,
	get,
	getAll,
	getAllEventsForProviders,
	getEventInformationForProvider,
	create,
	update,
};
