const { ElementInvalidException } = require("../exceptions/exceptions");
const moment = require('moment');
const DATE_REGEX = /^(0[1-9]|[1-2]\d|3[01])(\/)(0[1-9]|1[012])\2(\d{4})$/;
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_DAY = new Date().getDate();

const validateDateReceived = (property, message) => {
  const date = moment(property, 'DD/MM/YYYY').toDate();
  if (isNaN(date.getTime())) {
    throw new ElementInvalidException(`The days must exist in the month, and remember: ${message}`);
  }
}

/* Comprobar formato dd/mm/yyyy, que el no sea mayor de 12 y los días mayores de 31 */
const validateDateFormat = (date, message) => {
  if (!String(date).match(DATE_REGEX)) {
    throw new ElementInvalidException(`Days must be less than 31 and months less than 31, and remember: ${message}`);
  }
}

const validateDayMonthYear = (date, message) => {
		const day = parseInt(date.split('/')[0]);
		const month = parseInt(date.split('/')[1]);
		const year = parseInt(date.split('/')[2]);
		const monthDays = new Date(year, month, 0).getDate();
		if (day > monthDays) {
      throw new ElementInvalidException(`The days must exist in the month, and remember: ${message}`);
		}
    if (
      year < CURRENT_YEAR ||
      (year === CURRENT_YEAR && month < CURRENT_MONTH) ||
      (year === CURRENT_YEAR && month === CURRENT_MONTH && day <= CURRENT_DAY)
    ) {
      throw new ElementInvalidException(`The date must be in the future, and remember: ${message}`);
    }
}

const validateConsistencyDates = (startDate, endDate, message) => {
	if (startDate > endDate) {
    throw new ElementInvalidException(`${message}`);
	}
}

const throwExeptionIfDateInvalid = function (property, message) {
  try {
    validateDateReceived(property, message)
    validateDateFormat(property, message);
    validateDayMonthYear(property, message);
  } catch (e) {
    throw new ElementInvalidException(`Invalid date ${e}`);
  }
};

const throwExeptionIfEndDateIsAfterStartDate = function (start, end, message) {
  try {
    const startDate = moment(start, 'DD/MM/YYYY').toDate();
    const endDate = moment(end, 'DD/MM/YYYY').toDate();
    validateConsistencyDates(startDate, endDate, message);
  } catch (e) {
    throw new ElementInvalidException(`Invalid date ${e}`);
  }
};

module.exports = {
  throwExeptionIfDateInvalid,
  throwExeptionIfEndDateIsAfterStartDate,
};
