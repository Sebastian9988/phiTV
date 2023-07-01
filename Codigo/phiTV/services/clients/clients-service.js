require("dotenv").config();
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const { ElementAlreadyExist } = require("../../exceptions/exceptions.js");
const { ElementInvalidException } = require("../../exceptions/exceptions.js");
const { messageBinder } = require("./locale/locale-binder.js");
const { DtoResponse } = require("../../dto/dto-response.js");
const { validate } = require("./validate-clients.js");
const { pepareFilters } = require("./prepare-filters.js");
const { startTransmition } = require("./transmition.js");
const Client = require("../../data-access/data-access-mongo/Models/Clients.js");
const Event = require("../../data-access/data-access-mongo/Models/Events.js");
const {pipeline, DATE_ERROR, PURCHASE_ERROR, EVENT_ERROR} = require('./pipes-filters.js');
const { hashing } = require('../../common/encrypt');

const removeFromSubscription = async (client) => {
	if (client?.eventId) {
		const event = await Event.findOne({_id: client.eventId});
		if (event && event.subscribedClients) {
			event.subscribedClients = event.subscribedClients.filter(clientId => {
				return clientId.toString() !== client._id.toString();
			});
			await event.save();
		}
	}
}

const remove = async function (id) {
	let clientToRemove = await Client.findOne({ _id: id });
	if (!clientToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	removeFromSubscription(clientToRemove);
	let filter = { _id: id };
	await Client.findByIdAndDelete(filter);
	return;
};

const create = async function (aClient) {
	if (aClient.clientId) {
		let clientExists = await Client.findOne({ _id: aClient.clientId });
		if (clientExists) {
			throw new ElementAlreadyExist(messageBinder().alreadyExist);
		}
	}
	if (aClient.name) {
		let clientExists = await Client.findOne({ name: aClient.name });
		if (clientExists) {
			throw new ElementAlreadyExist(messageBinder().alreadyExist);
		}
	}
	validate(aClient);
	let client = new Client();
	client.name = aClient.name;
	client.password = hashing(aClient.password);
	client.userType = aClient.userType;
	client.birthDate = aClient.birthDate;
	client.email = aClient.email;
	client.country = aClient.country;
	let newClient = await client.save();
	return newClient;
};

const update = async function (id, aClient) {
	let clientForUpdate = await Client.findOne({ _id: id });
	if (!clientForUpdate) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	validate(aClient);
	let filter = { _id: id };
	try {
		await Client.findByIdAndUpdate(filter, aClient);
	} catch (err) {
		console.log("Un error al actualizar: " + JSON.stringify(err));
	}
	return aClient;
};

const getAll = async function (requestFilter) {
	let filter = pepareFilters(requestFilter);

	let clients = await Client.find(filter.where).skip(filter.skip).limit(filter.limit);
	if (!clients) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let response = new DtoResponse();
	response.data = clients;
	response.count = await Client.count(filter);
	return response;
};

const getEventsInformation = async function () {
	const approvedEvents = await Event.find({ authorized: true }).exec();
	if (approvedEvents.length === 0) {
		throw new ElementNotFoundException(messageBinder().notFoundEvents);
	}
	const eventsInfo = approvedEvents.map(event => {
		return {
			eventName: event.name,
			description: event.description,
			category: event.category,
			startDate: event.startDate,
			endDate: event.endDate,
			price: event.price ? event.price : "$0",
			subscribersCount: event.subscribedClients ? event.subscribedClients.length : 0
		}
	});
	return eventsInfo;
};

const get = async function (id) {
	let aClient = await Client.findOne({ _id: id });
	if (!aClient) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	return aClient;
};

const seeTransmition = function (clientId, eventId) {
  return new Promise(async (resolve, reject) => {
    pipeline.once('error', function(error) {
			if (error.message === EVENT_ERROR) {
				reject(new ElementNotFoundException(messageBinder().notFoundEvent));
			}
			if (error.message === DATE_ERROR) {
				reject(new ElementInvalidException(messageBinder().isNotTheMomentToSeeTheEvent));
			}
			if (error.message === PURCHASE_ERROR) {
				reject(new ElementInvalidException(messageBinder().clientHasNotPaidForEvent));
			}
    });
    pipeline.once('end', function(result) {
      console.log('Pipes and Filters completed');
	  startTransmition();
      resolve(result);
    });
    pipeline.execute({clientId, eventId});
  });
};

module.exports = {
	remove,
	get,
	getAll,
	getEventsInformation,
	create,
	update,
	seeTransmition,
};
