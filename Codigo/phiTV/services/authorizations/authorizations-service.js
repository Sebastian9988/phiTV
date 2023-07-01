require("dotenv").config();
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const { ElementAlreadyExist } = require("../../exceptions/exceptions.js");
const { ElementInvalidException } = require("../../exceptions/exceptions.js");
const { messageBinder } = require("./locale/locale-binder.js");
const { DtoResponse } = require("../../dto/dto-response.js");
const { validate } = require("./validate-authorizations.js");
const nodemailer = require('nodemailer');
const Authorization = require("../../data-access/data-access-mongo/Models/Authorizations.js");
const Unauthorization = require("../../data-access/data-access-mongo/Models/Unauthorizations.js");
const { pepareFilters } = require("./prepare-filters.js");
const Event = require("../../data-access/data-access-mongo/Models/Events");
const Provider = require("../../data-access/data-access-mongo/Models/Providers");
const config = require("config");
const hoursBeforeSendMail = config.get("hoursBeforeSendMail");
const DESTINATION_MAILS = config.get("destinationMails");
const ORIGIN_MAIL = '"phiTV Service" <seba.manya.10@gmail.com>';
const PENDING_EVENTS_ADVICE = "AVISO EVENTOS PENDIENTES";
const EVENT_UNAUTHORIZED = "AVISO EVENTO NO AUTORIZADO";
const EVENT_AUTHORIZED = "AVISO EVENTO AUTORIZADO";
const axios = require('axios');
const IS_AUTOMATIC = true;
const UNITY_REGULITY_REASON = 'The provider is not authorized by regulity unity';
const PAYMENT_GATEWAY_REASON = 'The provider has not paid to the Payment Gateway';
const MAIL_SERVER = process.env.MAIL_SERVER;
const MAIL_APP_PASSWORD_SERVER = process.env.MAIL_APP_PASSWORD_SERVER;


const createAuthorization = async (aAuthorization) => {
	let provider = await Provider.findOne({name: aAuthorization.providerName});
	let authorization = new Authorization();
	authorization.providerName = provider.name;
	authorization.eventName = aAuthorization.eventName;
	authorization.providerMail = provider.mail;
	authorization.providerId = provider._id;
	authorization.automaticAuthorization = aAuthorization.automaticAuthorization;
	authorization.date = new Date();
	authorization.url = `https://www.phiTV.net/${authorization._id}`;
	return authorization;
}

const createUnauthorizationConstructor = (providerName, eventName, reason, providerMail) => {
	let unauthorization = new Unauthorization();
	unauthorization.providerName = providerName;
	unauthorization.providerMail = providerMail;
	unauthorization.eventName = eventName;
	unauthorization.reason = reason;
	unauthorization.date = new Date();
	return unauthorization;
}

const removeUnauthorization = async function (id) {
	let unauthorizationToRemove = await Unauthorization.findOne({ _id: id });
	if (!unauthorizationToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let filter = { _id: id };
	await Unauthorization.findByIdAndDelete(filter);
	return;
};

const removeUnauthorizationByEventName = async function (eventName) {
	let unauthorizationToRemove = await Unauthorization.findOne({ eventName });
	if (!unauthorizationToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let filter = { _id: unauthorizationToRemove._id };
	await Unauthorization.findByIdAndDelete(filter);
	return;
};

const remove = async function (id) {
	let authorizationToRemove = await Authorization.findOne({ _id: id });
	if (!authorizationToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let filter = { _id: id };
	await Authorization.findByIdAndDelete(filter);
	try {
		await updateEventAvailability(authorizationToRemove.eventName);
	} catch (err) {
		console.log('Error al actualizar el evento:', err);
	}
	return;
};

const mailAuthorizationToProvider = (textToSend, providerMail) => {
	return {
    from: ORIGIN_MAIL,
    to: providerMail,
    subject: EVENT_AUTHORIZED,
    text: textToSend,
  }
}

const completeAuthorizationText = (providerName, eventName, url) => {
  return `Querido ${providerName}, le informamos que el evento ${eventName} ha sido autorizado correctamente. Link: ${url}`;
}

const sendAuthorizationToProvider = async (providerName, eventName, url, providerMail) => {
	let textToSend = completeAuthorizationText(providerName, eventName, url);
  await transporter.sendMail(mailAuthorizationToProvider(textToSend, providerMail), async (error, info) => {
		const event = await Event.findOne({name: eventName});
		if (error) {
      console.log('Error al enviar el correo:', error);
			event.failedMessages++;
  	} else {
			event.sentMessages++;
      console.log('Correo electrónico enviado:', info.response);
    }
		await event.save();
  });
}

const updateEventAvailability = async function (eventName) {
	let eventToUpdate = await Event.findOne({ name: eventName });
	if (!eventToUpdate) {
		throw new ElementNotFoundException(messageBinder().eventNotFound);
	}
	eventToUpdate.authorized = !eventToUpdate.authorized;
	await eventToUpdate.save();
};

const daysMonthsYearsToMonthsDaysYears = (date) => {
	const dateObj = new Date(date);
	const year = dateObj.getUTCFullYear();
	const month = dateObj.getUTCMonth() + 1;
	const day = dateObj.getUTCDate();
	return new Date(`${day}/${month}/${year}`);
};

const validateAuthorizationAsync = async (aAuthorization) => {
	if (aAuthorization?.eventName) {
		const authorizationExists = await Authorization.findOne({ eventName: aAuthorization?.eventName });
		const eventToFind = await Event.findOne({ name: aAuthorization.eventName });
		const providerToFind = await Provider.findOne({ name: aAuthorization.providerName });
		if (!eventToFind) {
			throw new ElementAlreadyExist(messageBinder().eventNotFound);
		}
		if (!providerToFind) {
			throw new ElementAlreadyExist(messageBinder().providerNotFound);
		}
		const now = new Date();
		const eventStartDate = daysMonthsYearsToMonthsDaysYears(`${eventToFind?.startDate}`);
		if (now > eventStartDate) {
			throw new ElementInvalidException(messageBinder().authorizationMadeAfterEventStarted);
		}
		if (authorizationExists) {
			throw new ElementAlreadyExist(messageBinder().alreadyExist);
		}
	}
}

const callTheServices = async (aAuthorization, isAutomatic) => {
	const provider = await Provider.findOne({name: aAuthorization.providerName});
	const responseRegulatoryUnit = await axios.get(`http://localhost:4000/api/providerRegulatoryUnitsByName/${provider.name}`);
	const responsePaymentGateway = isAutomatic ? await axios.get(`http://localhost:5000/api/providerPaymentGatewaysByName/${provider.name}`) : null;
	return {isAuthorizedByRegulityUnity: responseRegulatoryUnit?.data?.authorized, hasPaid: isAutomatic ? responsePaymentGateway?.data?.hasPaid : true}
}

const create = async function (aAuthorization, isAutomatic) {
	await validateAuthorizationAsync(aAuthorization);
	const {isAuthorizedByRegulityUnity, hasPaid} = await callTheServices(aAuthorization, isAutomatic);
	const {isValid, reason} = validate(isAuthorizedByRegulityUnity, hasPaid, isAutomatic);

	let authorization = isValid ? await createAuthorization(aAuthorization) : null;
	let newAuthorization = isValid ? await authorization.save() : null;
	if (isValid && newAuthorization) {
		await sendAuthorizationToProvider(newAuthorization?.providerName, newAuthorization?.eventName, newAuthorization?.url, newAuthorization?.providerMail);
		try {
			await updateEventAvailability(newAuthorization.eventName);
		} catch (err) {
			console.log('Error al actualizar el evento:', err);
		}
	}
	let result = {newAuthorization, reason};
	return result;
};

const authorizeAutomaticEvent = async (event) => {
	try {
		const { name: eventName, providerId } = event;
		const {name: providerName, mail: providerMail} = await Provider.findOne({ _id: providerId }).exec();
		if (providerName && providerMail) {
			const existAuthorization = await Authorization.findOne({ providerName, eventName, providerId }).exec();
			if (!existAuthorization) {
				const aAuthorization = {
					providerName,
					eventName,
					providerId,
					providerMail,
					automaticAuthorization: IS_AUTOMATIC,
				};
				const {newAuthorization, reason} = await create(aAuthorization, IS_AUTOMATIC);
				if (newAuthorization) {
					console.log('Autorización automática realizada:', newAuthorization);
					await removeUnauthorizationByEventName(eventName);
				} else {
					const newUnauthorization = await createUnauthorization(providerName, eventName, reason, providerMail);
					if (newUnauthorization) {
						console.log('No se pudo realizar una autorización automática:', newUnauthorization);
					}
				}
			}
		}
	} catch (err) {
		console.error('Error en la autorización automática:', err.message);
	}
};

const authorizePendingEvents = async () => {
	const events = await Event.find().exec();
	events.forEach((event) => authorizeAutomaticEvent(event));
}

const unauthorizeAutomaticEvents = async () => {
	try {
		const authorizations = await Authorization.find().exec();
		authorizations?.forEach(async (authorization) => {
			const {isAuthorizedByRegulityUnity, hasPaid} = await callTheServices(authorization, IS_AUTOMATIC);
			if (!isAuthorizedByRegulityUnity || !hasPaid) {
				await remove(authorization._id);
				const newUnauthorization = await createUnauthorization(authorization?.providerName, authorization?.eventName, !hasPaid ? PAYMENT_GATEWAY_REASON : UNITY_REGULITY_REASON, authorization?.providerMail);
				if (newUnauthorization) {
					console.log('No se pudo realizar una autorización automática:', newUnauthorization);
				}
				console.log('Se elimino la autorizacion de manera automatica');
			}
		});
	} catch (err) {
		console.error('Error al obtener las autorizaciones:', err);
		return [];
	}
};

const completeText = (providerName, eventName, reason) => {
  return `Querido ${providerName}, lamentamos informar que el evento ${eventName} no ha sido autorizado. Motivo: ${reason}`;
}

const mailInfoToProvider = (textToSend, providerMail) => {
	return {
    from: ORIGIN_MAIL,
    to: providerMail,
    subject: EVENT_UNAUTHORIZED,
    text: textToSend,
  }
}

const sendUnauthorizationToProvider = async (providerName, eventName, reason, providerMail) => {
	let textToSend = completeText(providerName, eventName, reason);
  await transporter.sendMail(mailInfoToProvider(textToSend, providerMail), (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error);
  	} else {
      console.log('Correo electrónico enviado:', info.response);
    }
  });
}

const createUnauthorization = async function (providerName, eventName, reason, providerMail) {
	if (eventName) {
		let unauthorizationExists = await Unauthorization.findOne({ eventName: eventName });
		if (!unauthorizationExists) {
			let unauthorization = createUnauthorizationConstructor(providerName, eventName, reason, providerMail);
			let newUnauthorization = await unauthorization.save();
			await sendUnauthorizationToProvider(providerName, eventName, reason, providerMail)
			return newUnauthorization;
		}
	}
	return null;

};

const getAllUnautorized = async function (requestFilter) {
	let filter = pepareFilters(requestFilter);
	let unauthorizations = await Unauthorization.find(filter.where).skip(filter.skip).limit(filter.limit);
	if (!unauthorizations) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let response = new DtoResponse();
	response.data = unauthorizations;
	response.count = await Unauthorization.count(filter);
	return response;
};

const getAll = async function (requestFilter) {
	let filter = pepareFilters(requestFilter);
	let authorizations = await Authorization.find(filter.where).skip(filter.skip).limit(filter.limit);
	if (!authorizations) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let response = new DtoResponse();
	response.data = authorizations;
	response.count = await Authorization.count(filter);
	return response;
};

const isAvailableToSendMail = (authorization, startDate) => {
	const now = new Date();
	return !authorization && startDate - now <= hoursBeforeSendMail * 60 * 60 * 1000;
}

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: MAIL_SERVER,
		pass: MAIL_APP_PASSWORD_SERVER,
	},
});

const addEventsToMailText = (eventsToSendMails) => {
  let text = "Faltan aprobar los siguientes eventos:";
  eventsToSendMails.forEach((event) => {
    text = `${text} ${event?.name}`;
  })
	return text;
}

const mailInformation = (textToSend) => {
	return {
    from: ORIGIN_MAIL,
    to: DESTINATION_MAILS,
    subject: PENDING_EVENTS_ADVICE,
    text: textToSend,
  }
}

const sendMailToEvents = async (eventsToSendMails) => {
	let textToSend = addEventsToMailText(eventsToSendMails);
  await transporter.sendMail(mailInformation(textToSend), (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error);
  	} else {
      console.log('Correo electrónico enviado:', info.response);
    }
  });
}

const collectEventsToSendMail = async () => {
  try {
		const events = await Event.find().exec();
		if (events) {
			let eventsToSendMails = [];
			for await (const event of events) {
				const authorization = await Authorization.findOne({ eventName: event.name }).exec();
				if (isAvailableToSendMail(authorization, event.startDate)) {
					eventsToSendMails = [event, ...eventsToSendMails];
				}
			}
			if (eventsToSendMails.length > 0) {
				sendMailToEvents(eventsToSendMails);
			}
		}
  } catch (err) {
    console.error('Error mandar mail:', err);
    return [];
  }
};

module.exports = {
	create,
	getAll,
	remove,
	collectEventsToSendMail,
	removeUnauthorization,
	getAllUnautorized,
	createUnauthorization,
	authorizePendingEvents,
	unauthorizeAutomaticEvents,
};
