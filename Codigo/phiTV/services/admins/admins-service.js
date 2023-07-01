require("dotenv").config();
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const { ElementAlreadyExist } = require("../../exceptions/exceptions.js");
const { messageBinder } = require("./locale/locale-binder.js");
const { DtoResponse } = require("../../dto/dto-response.js");
const { validate } = require("./validate-admins.js");
const { pepareFilters } = require("./prepare-filters.js");
const Admin = require("../../data-access/data-access-mongo/Models/Admins.js");
const Query = require("../../data-access/data-access-mongo/Models/Querys.js");
const Event = require("../../data-access/data-access-mongo/Models/Events.js");
const { hashing } = require('../../common/encrypt');
const moment = require('moment');
const Authorization = require("../../data-access/data-access-mongo/Models/Authorizations.js");

const remove = async function (id) {
	let adminToRemove = await Admin.findOne({ _id: id });
	if (!adminToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let filter = { _id: id };
	await Admin.findByIdAndDelete(filter);
	return;
};


const removeQuery = async function (id) {
	let queryToRemove = await Query.findOne({ _id: id });
	if (!queryToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let filter = { _id: id };
	await Query.findByIdAndDelete(filter);
	return;
};

const create = async function (aAdmin) {
	if (aAdmin.adminId) {
		let adminExists = await Admin.findOne({ _id: aAdmin.adminId });
		if (adminExists) {
			throw new ElementAlreadyExist(messageBinder().alreadyExist);
		}
	}
	validate(aAdmin);
	let admin = new Admin();
	admin.userName = aAdmin.userName;
	admin.password = hashing(aAdmin.password);
	admin.mail = aAdmin.mail;
	admin.userType = aAdmin.userType;
	let newAdmin = await admin.save();
	return newAdmin;
};

const createQuery = async function (queryToCreate) {
	let query = new Query();
	query.avaragePurchaseTime = queryToCreate.avaragePurchaseTime;
	query.maximunNumberOfConcurrentClients = queryToCreate.maximunNumberOfConcurrentClients;
	query.avarageTimeToSeeTransmition = queryToCreate.avarageTimeToSeeTransmition;
	let newQuery = await query.save();
	return newQuery;
};

const update = async function (id, aAdmin) {
	let adminForUpdate = await Admin.findOne({ _id: id });
	if (!adminForUpdate) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	validate(aAdmin);
	let filter = { _id: id };
	try {
		await Admin.findByIdAndUpdate(filter, aAdmin);
	} catch (err) {
		console.log("Un error al actualizar: " + JSON.stringify(err));
	}
	return aAdmin;
};

const getAll = async function (requestFilter) {
	let filter = pepareFilters(requestFilter);

	let admins = await Admin.find(filter.where).skip(filter.skip).limit(filter.limit);
	if (!admins) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let response = new DtoResponse();
	response.data = admins;
	response.count = await Admin.count(filter);
	return response;
};

const getAllQuerys = async function () {
	let querys = await Query.find().exec();
	if (!querys) {
		throw new ElementNotFoundException(messageBinder().notFoundQuerys);
	}
	return querys;
};

const get = async function (id) {
	let aAdmin = await Admin.findOne({ _id: id });
	if (!aAdmin) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	return aAdmin;
};

const response = async (events) => {
	const querys = await Query.find().exec();
	const { maximunNumberOfConcurrentClients, avarageTimeToSeeTransmition } = querys[0];
	const eventsInfo = events.map(event => {
		const {subscribedClients} = event;
		return {
			subscribedClients: subscribedClients ? subscribedClients.length : 0,
			concurrentClients: maximunNumberOfConcurrentClients,
			avarageTimeToSeeTransmition,
		}
	});
	return {
		eventsInfo,
		eventsAmount: events.length,
	}
}

const getAllActiveEvents = async function () {
	const currentDate = new Date();
	const events = await Event.find({
	  startDate: { $lte: currentDate },
	  endDate: { $gte: currentDate }
	});
	if (events.length === 0) {
		throw new ElementNotFoundException(messageBinder().notFoundActiveEvents);
	}
	return await response(events);
};

const getDatesParsed = ({from, to}) => {
	return {
		newFrom: moment(from, 'DD/MM/YYYY').toDate(),
		newTo: moment(to, 'DD/MM/YYYY').toDate(),
	}
}

const divideAutomaticAndManualEvents = ({ events, authorizations }) => {
  return events.reduce((result, event) => {
    const authorization = authorizations.find(a => a.eventName === event.name);
    let eventType = '';
    switch (authorization?.automaticAuthorization) {
      case true:
        eventType = 'automaticEvents';
        break;
      case false:
        eventType = 'manualEvents';
        break;
      default:
        eventType = 'unaprovedEvents';
    }
    result[eventType].push(event);
    return result;
  }, { manualEvents: [], automaticEvents: [], unaprovedEvents: [] });
};

const getAllActiveEventsFromTo = async function ({ from, to }) {
	const { newFrom, newTo } = getDatesParsed({ from, to });
	const filterDate = { $gte: newFrom, $lte: newTo };
	const findFilter = {$or: [{ startDate: filterDate },	{ endDate: filterDate }]};
	const events = await Event.find(findFilter);
	if (events.length === 0) {
    throw new ElementNotFoundException(messageBinder().notFoundActiveEvents);
  }
	const authorizations = await Authorization.find().exec();
	const {manualEvents, automaticEvents, unaprovedEvents} = divideAutomaticAndManualEvents({events, authorizations});
	let subscribedUsersCount = 0;
  events.forEach(event => {
    subscribedUsersCount += event.subscribedClients.length;
  });

  return {
    manualEvents,
    automaticEvents,
    unaprovedEvents,
    eventsAmount: events.length,
    manualEventsAmount: manualEvents.length,
    automaticEventsAmount: automaticEvents.length,
    unaprovedEventsEventsAmount: unaprovedEvents.length,
    subscribedUsersCount
  };
};

module.exports = {
	remove,
	removeQuery,
	get,
	getAll,
	getAllQuerys,
	getAllActiveEvents,
	getAllActiveEventsFromTo,
	create,
	createQuery,
	update,
};
