const { ElementInvalidException } = require("../../exceptions/exceptions");
const { throwExeptionIfUndefined } = require("../../common/object-validate");
const { throwExeptionIfNotHasProperty } = require("../../common/object-validate");
const { throwExeptionIfDateInvalid } = require("../../common/date-validate");
const { throwExeptionIfUnauthorizedByRegulityUnity } = require("../../common/authorized-regulity-unity-validate");
const { throwExeptionIfHasNotPaidToPaymentGateway } = require("../../common/authorized-payment-gateway-validate");
const { throwExeptionIfAuthorizationExists } = require("../../common/authorization-exists-validate.js");
const { thworExeptionIfAuthorizedAfterEventStarted } = require("../../common/authorized-event-after-started");
const { messageBinder } = require("./locale/locale-binder");

const validate = (isAuthorizedByRegulityUnity, hasPaid, isAutomatic) => {
  try {
    throwExeptionIfUnauthorizedByRegulityUnity(isAuthorizedByRegulityUnity, messageBinder().authorizationByRegulityUnityIsMissing);
    throwExeptionIfHasNotPaidToPaymentGateway(isAutomatic ? hasPaid : true, messageBinder().hasNotPaidToPaymentGateway);
    return {isValid: true, reason: 'Is valid'};
  } catch (error) {
    if (isAutomatic) {
      console.log('Invalid operation:', error.message);
    } else {
      throw new ElementInvalidException(`Invalid ${error}`);
    }
      return {isValid: false, reason: error.message};
  }
};

module.exports = {
	validate,
};