const { ElementInvalidException } = require("../exceptions/exceptions");
const { getISOCode, getCurrencyName, getFullInformation } = require('currency-iso');
const isoCurrencies = require('iso-currencies');

const throwExeptionIfInvalidCurrencyCode = function ({currencyCode}, message) {
	const existsCode = getISOCode(currencyCode);
  if (!existsCode) {
    throw new ElementInvalidException(message);
  }
};

const throwExeptionIfInvalidCurrencyName = function ({currencyName, currencyCode}, message) {
	const name = getCurrencyName(currencyCode);
	if (currencyName !== name) {
		throw new ElementInvalidException(`${message} ${name}?`);
	}
};

const throwExeptionIfInvalidCurrencySymbol = function ({currencySymbol, currencyCode}, message) {
	const symbol = isoCurrencies.information(currencyCode).symbol;
	if (currencySymbol !== symbol) {
		throw new ElementInvalidException(`${message} ${symbol}?`);
	}
};

module.exports = {
    throwExeptionIfInvalidCurrencyCode,
		throwExeptionIfInvalidCurrencyName,
		throwExeptionIfInvalidCurrencySymbol,
};
