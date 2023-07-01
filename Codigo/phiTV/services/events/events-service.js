require("dotenv").config();
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const { ElementAlreadyExist } = require("../../exceptions/exceptions.js");
const { ElementInvalidException } = require("../../exceptions/exceptions.js");
const { messageBinder } = require("./locale/locale-binder.js");
const { DtoResponse } = require("../../dto/dto-response.js");
const { validate } = require("./validate-events");
const { pepareFilters } = require("./prepare-filters.js");
const moment = require('moment');
const Event = require("../../data-access/data-access-mongo/Models/Events.js");
const Client = require("../../data-access/data-access-mongo/Models/Clients.js");
const nodemailer = require('nodemailer');
const ORIGIN_MAIL = '"phiTV Service" <seba.manya.10@gmail.com>';
const PENDING_EVENTS_ADVICE = "INFORMACION REELEVANTE DE EVENTO";
const LogService = require("../logs-queue/logs-service.js");
const Log = require("../../data-access/data-access-mongo/Models/Log.js");
const Provider = require("../../data-access/data-access-mongo/Models/Providers.js");
const Authorization = require("../../data-access/data-access-mongo/Models/Authorizations.js");
const MAIL_SERVER = process.env.MAIL_SERVER;
const MAIL_APP_PASSWORD_SERVER = process.env.MAIL_APP_PASSWORD_SERVER;

const emptySubscriptions = async (event) => {
	if (event?.subscribedClients) {
		event.subscribedClients.forEach(async clientId => {
			const client = await Client.findOne({_id: clientId});
			if (client) {
				client.eventId = null;
				try {
					await client?.save();
				} catch (err) {
					console.log("Un error al actualizar: " + JSON.stringify(err));
				}
			}
		});
	}
}

const removeAuthorization = async function (eventName) {
	let authorizationToRemove = await Authorization.findOne({ eventName });
	if (authorizationToRemove) {
		let filter = { _id: authorizationToRemove._id };
		await Authorization.findByIdAndDelete(filter);
	}
};

const remove = async function (id) {
	let eventToRemove = await Event.findOne({ _id: id });
	if (!eventToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	await removeAuthorization(eventToRemove.name);
	await emptySubscriptions(eventToRemove);
	let filter = { _id: id };
	await Event.findByIdAndDelete(filter);
	return;
};

const getDatesParsed = (aEvent) => {
	return {
		startDate: moment(aEvent.startDate, 'DD/MM/YYYY').toDate(),
		endDate: moment(aEvent.endDate, 'DD/MM/YYYY').toDate(),
		publishDate: moment(aEvent.publishDate, 'DD/MM/YYYY').toDate(),
		notificationsDate: moment(aEvent.notificationsDate, 'DD/MM/YYYY').toDate(),
	}
}

const createEvent = (aEvent, provider) => {
	const {startDate, endDate, publishDate, notificationsDate} = getDatesParsed(aEvent);
	let event = new Event();
	event.name = aEvent.name;
	event.description = aEvent.description;
	event.startDate = startDate;
	event.endDate = endDate;
	event.thumbnailImage = aEvent.thumbnailImage;
	event.mainImage = aEvent.mainImage;
	event.category = aEvent.category;
	event.video = aEvent.video;
	event.video = aEvent.video;
	event.price = `${provider.currencySymbol}${provider.price}`;
	event.publishDate = publishDate;
	event.notificationsDate = notificationsDate;
	event.providerId = aEvent.providerId;
	event.authorized = false;
	return event;
}

const create = async function (aEvent) {
	if (aEvent.name) {
		let eventExists = await Event.findOne({ name: aEvent.name });
		if (eventExists) {
			throw new ElementAlreadyExist(messageBinder().alreadyExist);
		}
	}
	let providerExists;
	if (aEvent.providerId) {
		providerExists = await Provider.findOne({ _id: aEvent.providerId });
		if (!providerExists) {
			throw new ElementAlreadyExist(messageBinder().notFoundProvider);
		}
	}
	validate(aEvent);
	let event = createEvent(aEvent, providerExists);
	let newEvent = await event.save();
	const typeOfEntry = `Event ${aEvent.name} created`;
	await addToEventLog(aEvent, typeOfEntry);
	return newEvent;
};

const update = async function (id, aEvent) {
	let eventForUpdate = await Event.findOne({ _id: id });
	let eventNameAlreadyExists = await Event.findOne({ name: aEvent.name });
	if (!eventForUpdate) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	if (eventNameAlreadyExists && eventNameAlreadyExists._id.toString() !== id) {
		throw new ElementAlreadyExist(messageBinder().alreadyExist);
	}
	aEvent.authorized = eventForUpdate.authorized;
	validate(aEvent);
	const {startDate, endDate, publishDate, notificationsDate} = getDatesParsed(aEvent);
	aEvent.subscribedClients = eventForUpdate.subscribedClients;
	aEvent.startDate = startDate;
	aEvent.endDate = endDate;
	aEvent.publishDate = publishDate;
	aEvent.notificationsDate = notificationsDate;
	let filter = { _id: id };
	try {
		await Event.findByIdAndUpdate(filter, aEvent);
		const typeOfEntry = `Event ${eventForUpdate.name} updated.`;
		await addToEventLog(aEvent, typeOfEntry);
	} catch (err) {
		console.log("Un error al actualizar: " + JSON.stringify(err));
	}
	return aEvent;
};

const validateSubscription = (client, eventForUpdate) => {
	if (!eventForUpdate) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
  if (!client) {
		throw new ElementNotFoundException(messageBinder().notFoundClient);
  }
	if (!eventForUpdate.authorized) {
		throw new ElementInvalidException(messageBinder().unauthorizedEventSubscription);
	}
	eventForUpdate?.subscribedClients.forEach((clientId) => {
		if (client?._id.toString() === clientId.toString()) {
			throw new ElementAlreadyExist(messageBinder().subscriptionAlreadyExist);
		}
	});
}

const addToEventLog = async function (aEvent, typeOfEntry) {
	let log = new Log();
	log.providerId = aEvent.providerId;
	log.typeOfEntry = typeOfEntry;
	log.dateOfEntry = new Date().toISOString();
	await LogService.create(log);
}

const updateSubscriptions = async function (id, asubscription) {
	let eventForUpdate = await Event.findOne({ _id: id });
	const client = await Client.findOne({ _id: asubscription?.clientId });
	validateSubscription(client, eventForUpdate);
	client.eventId = id;
	eventForUpdate.subscribedClients.push(client)
	let filter = { _id: id };
	try {
		await Event.findByIdAndUpdate(filter, eventForUpdate);
		await client.save();
		const typeOfEntry = `Client ${client.name} subscribed to ${eventForUpdate.name}d.`;
		await addToEventLog(eventForUpdate, typeOfEntry);
	} catch (err) {
		console.log("Un error al actualizar: " + JSON.stringify(err));
	}
	return eventForUpdate;
};

const getAll = async function (requestFilter) {
  let filter = pepareFilters(requestFilter);

  let events = await Event.find(filter.where)
    .skip(filter.skip)
    .limit(filter.limit);
  if (!events) {
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  let response = new DtoResponse();
  response.data = events;
  response.count = await Event.count(filter);
  return response;
};

const getAllApproved = async function () {
	const now = new Date();
  let events = await Event.find().exec();
  let approvedEvents = events.filter((event) => {
    return event.authorized === true && event.endDate >= now;
  });
  if (approvedEvents.length === 0) {
    throw new ElementNotFoundException(messageBinder().notFoundEventsApproved);
  }
  let response = new DtoResponse();
  response.data = approvedEvents;
  return response;
};

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: MAIL_SERVER,
		pass: MAIL_APP_PASSWORD_SERVER,
	},
});

const mailInformation = (textToSend, subscribedMailsString) => {
	return {
    from: ORIGIN_MAIL,
    to: subscribedMailsString,
    subject: PENDING_EVENTS_ADVICE,
    text: textToSend,
  }
}

const setTextInformation = (event) => {
	return `El evento ${event.name} con fecha de inicio ${event.startDate} y fecha de fin ${event.endDate}. Aqui hay una breve descripcion: ${event.description}`;
}

const sendMails = async (event) => {
  const subscribedMails = await Promise.all(event.subscribedClients.map(async (clientId) => {
    const client = await Client.findOne({ _id: clientId });
    if (client) {
      return client.email;
    }
  }));
	const subscribedMailsString = subscribedMails.join(', ');
	let textToSend = setTextInformation(event);
  await transporter.sendMail(mailInformation(textToSend, subscribedMailsString), (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error);
  	} else {
      console.log('Correo electrónico enviado:', info.response);
    }
  });
};


const getEventInfo = async function (id) {
	let aEvent = await Event.findOne({ _id: id });
	if (!aEvent) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	if (aEvent.subscribedClients.length === 0) {
		throw new ElementNotFoundException(messageBinder().notFoundSubscribedClients);
	}
	sendMails(aEvent);

	return aEvent;
};

const get = async function (id) {
  let aEvent = await Event.findOne({ _id: id });
  if (!aEvent) {
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  return aEvent;
};

module.exports = {
	remove,
	get,
	getAll,
	getAllApproved,
	create,
	update,
	updateSubscriptions,
	getEventInfo,
};
