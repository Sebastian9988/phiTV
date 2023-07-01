require("dotenv").config();
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const { ElementAlreadyExist } = require("../../exceptions/exceptions.js");
const { messageBinder } = require("./locale/locale-binder.js");
const { DtoResponse } = require("../../dto/dto-response.js");
const { validate } = require("./validate-providerRegulatoryUnits");
const { pepareFilters } = require("./prepare-filters.js");
const ProviderRegulatoryUnit = require("../../data-access/data-access-mongo/Models/ProviderRegulatoryUnits");

const remove = async function (id) {
	let providerRegulatoryUnitToRemove = await ProviderRegulatoryUnit.findOne({ _id: id });
	if (!providerRegulatoryUnitToRemove) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let filter = { _id: id };
	await ProviderRegulatoryUnit.findByIdAndDelete(filter);
	return;
};

const removeByName = async function (name) {
	const result = await ProviderRegulatoryUnit.deleteOne({ name });
	if (result.deletedCount === 0) {
	  throw new ElementNotFoundException('No se encontró el proveedor para eliminar');
	}
	return;
};

const create = async function (aProviderRegulatoryUnit) {
	if (aProviderRegulatoryUnit.providerRegulatoryUnitId) {
		let providerRegulatoryUnitExists = await ProviderRegulatoryUnit.findOne({ _id: aProviderRegulatoryUnit.providerRegulatoryUnitId });
		if (providerRegulatoryUnitExists) {
			throw new ElementAlreadyExist(messageBinder().alreadyExist);
		}
	}
	validate(aProviderRegulatoryUnit);
	let providerRegulatoryUnit = new ProviderRegulatoryUnit();
	providerRegulatoryUnit.name = aProviderRegulatoryUnit.name;
	providerRegulatoryUnit.authorized = aProviderRegulatoryUnit.authorized;
	let newProviderRegulatoryUnit = await providerRegulatoryUnit.save();
	return newProviderRegulatoryUnit;
};

const update = async function (id, aProviderRegulatoryUnit) {
	let providerRegulatoryUnitForUpdate = await ProviderRegulatoryUnit.findOne({ _id: id });
	if (!providerRegulatoryUnitForUpdate) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	validate(aProviderRegulatoryUnit);
	let filter = { _id: id };
	try {
		await ProviderRegulatoryUnit.findByIdAndUpdate(filter, aProviderRegulatoryUnit);
	} catch (err) {
		console.log("Un error al actualizar: " + JSON.stringify(err));
	}
	return aProviderRegulatoryUnit;
};

const getAll = async function (requestFilter) {
	let filter = pepareFilters(requestFilter);

	let providerRegulatoryUnits = await ProviderRegulatoryUnit.find(filter.where).skip(filter.skip).limit(filter.limit);
	if (!providerRegulatoryUnits) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	let response = new DtoResponse();
	response.data = providerRegulatoryUnits;
	response.count = await ProviderRegulatoryUnit.count(filter);
	return response;
};

const get = async function (providerName) {
	let aProviderRegulatoryUnit = await ProviderRegulatoryUnit.findOne({ name: providerName });
	if (!aProviderRegulatoryUnit) {
		throw new ElementNotFoundException(messageBinder().notFound);
	}
	return aProviderRegulatoryUnit;
};

module.exports = {
	remove,
	removeByName,
	get,
	getAll,
	create,
	update,
};
