require("dotenv").config();
const queue = require("../../queues/queue-binder.js");
const logsQueue = queue.bind(process.env.QUEUE);
const { DtoResponse } = require("../../dto/dto-response.js");
const moment = require('moment');
const Log = require("../../data-access/data-access-mongo/Models/Log.js")
const { messageBinder } = require("./locale/locale-binder.js");
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");

const create = async function (aLog) {
	let log = new Log();
	log.providerId = aLog.providerId;
	log.typeOfEntry = aLog.typeOfEntry;
	log.dateOfEntry = new Date().toISOString();
	let newLog = await log.save();
	sendToQueue(newLog);
	return newLog;
};

const sendToQueue = (aLog) => {
	logsQueue.add(aLog);
};

const getDatesParsed = ({from, to}) => {
	return {
		newFrom: moment(from, 'DD/MM/YYYY').toDate(),
		newTo: moment(to, 'DD/MM/YYYY').toDate(),
	}
}

const validateDates = ({newFrom: from, newTo: to}) => {
	if (from > to) {
		throw new ElementNotFoundException(messageBinder().fromIsAfterTo);
	}
}

const filterLogsFromTo = ({logs, from, to}) => {
	return logs.filter((log) => {
		const {newFrom, newTo} = getDatesParsed({from, to});
		validateDates({newFrom, newTo});
		return log.dateOfEntry >= newFrom && log.dateOfEntry <= newTo;
	});
}

const getAll = async function ({from, to}) {
	const logs = await Log.find().exec();
	if (logs.length === 0) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	const logsFiltered = filterLogsFromTo({logs, from, to});
	if (logsFiltered.length === 0) {
		throw new ElementNotFoundException(messageBinder().notFoundOnThatDate);
	}
	let response = new DtoResponse();
	response.data = logsFiltered;
	response.count = await Log.count(logsFiltered);
	return response;
};

const deleteAll = async function () {
	let logs = await Log.find().exec();
	if (!logs) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	logs.forEach(async log => await Log.findByIdAndDelete({_id:log._id}));
	return;
};

module.exports = {
	getAll,
	create,
	deleteAll,
};
