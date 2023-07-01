require("dotenv").config();
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const { ElementAlreadyExist } = require("../../exceptions/exceptions.js");
const { messageBinder } = require("./locale/locale-binder.js");
const { DtoResponse } = require("../../dto/dto-response.js");
const { validate } = require("./validate-providerPaymentGateways");
const { pepareFilters } = require("./prepare-filters.js");
const ProviderPaymentGateway = require("../../data-access/data-access-mongo/Models/ProviderPaymentGateways.js");

const remove = async function (id) {
	let providerPaymentGatewayToRemove = await ProviderPaymentGateway.findOne({ _id: id });
	if (!providerPaymentGatewayToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let filter = { _id: id };
	await ProviderPaymentGateway.findByIdAndDelete(filter);
	return;
};

const removeByName = async function (name) {
	const result = await ProviderPaymentGateway.deleteOne({ name });
	if (result.deletedCount === 0) {
	  throw new ElementNotFoundException('No se encontró el proveedor para eliminar');
	}
	return;
};

const create = async function (aProviderPaymentGateway) {
	if (aProviderPaymentGateway.providerPaymentGatewayId) {
		let providerPaymentGatewayExists = await ProviderPaymentGateway.findOne({ _id: aProviderPaymentGateway.providerPaymentGatewayId });
		if (providerPaymentGatewayExists) {
			throw new ElementAlreadyExist(messageBinder().alreadyExist);
		}
	}
	validate(aProviderPaymentGateway);
	let providerPaymentGateway = new ProviderPaymentGateway();
	providerPaymentGateway.name = aProviderPaymentGateway.name;
	providerPaymentGateway.hasPaid = aProviderPaymentGateway.hasPaid;
	let newProviderPaymentGateway = await providerPaymentGateway.save();
	return newProviderPaymentGateway;
};

const update = async function (id, aProviderPaymentGateway) {
	let providerPaymentGatewayForUpdate = await ProviderPaymentGateway.findOne({ _id: id });
	if (!providerPaymentGatewayForUpdate) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	validate(aProviderPaymentGateway);
	let filter = { _id: id };
	try {
		await ProviderPaymentGateway.findByIdAndUpdate(filter, aProviderPaymentGateway);
	} catch (err) {
		console.log("Un error al actualizar: " + JSON.stringify(err));
	}
	return aProviderPaymentGateway;
};

const getAll = async function (requestFilter) {
	let filter = pepareFilters(requestFilter);

	let providerPaymentGateways = await ProviderPaymentGateway.find(filter.where).skip(filter.skip).limit(filter.limit);
	if (!providerPaymentGateways) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let response = new DtoResponse();
	response.data = providerPaymentGateways;
	response.count = await ProviderPaymentGateway.count(filter);
	return response;
};

const get = async function (providerName) {
	let aProviderPaymentGateway = await ProviderPaymentGateway.findOne({ name: providerName });
	if (!aProviderPaymentGateway) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	return aProviderPaymentGateway;
};

const getProvidersThatHavePaid = async function (requestFilter) {
	let filter = pepareFilters(requestFilter);

	let providerPaymentGateways = await ProviderPaymentGateway.find(filter.where).skip(filter.skip).limit(filter.limit);
	if (!providerPaymentGateways) {
		throw new ElementNotFoundException(messageBinder().notFoundProviders);
	}
	const providersThatHavePaid = providerPaymentGateways.filter(provider => {
		return provider.hasPaid;
	});
	let response = new DtoResponse();
	response.data = providersThatHavePaid;
	response.count = providersThatHavePaid.length;
	return response;
};

module.exports = {
	remove,
	removeByName,
	get,
	getAll,
	getProvidersThatHavePaid,
	create,
	update,
};
