const axios = require('axios');
const Pipeline = require('pipes-and-filters');
const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const pipeline = Pipeline.create('Validation client')
const { messageBinder } = require("./locale/locale-binder");
require('dotenv').config();
const API_KEY = process.env.API_KEY;
const Purchase = require("../../data-access/data-access-mongo/Models/Purchases.js");
const Event = require("../../data-access/data-access-mongo/Models/Events.js");

const DATE_ERROR = 'DATE_ERROR';
const PURCHASE_ERROR = 'PURCHASE_ERROR';
const EVENT_ERROR = 'EVENT_ERROR';

const validateEvent = async function({ eventId, clientId }, next){
  const event = await Event.findOne({_id: eventId});
  if (!event) {
    return next(Error(EVENT_ERROR));
  }
  next(null, { ...event, clientId }); 
};

const validateDate = function({_doc: event, clientId}, next){
  const {startDate, endDate} = event;
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now > end || now < start) {
    return next(Error(DATE_ERROR));   
  }
  next(null, { ...event, clientId }); 
};

const validateClientPurchase = async function({ _id: eventId, clientId, ...event }, next){
  const purchaseExists = await Purchase.findOne({eventId, clientId});
  if (!purchaseExists) {
    return next(Error(PURCHASE_ERROR));   
  }
  next(null, { ...event, clientId }); 
};

// pipeline
pipeline.use(validateEvent);
pipeline.use(validateDate);
pipeline.use(validateClientPurchase);

module.exports = {
	pipeline,
	DATE_ERROR,
  PURCHASE_ERROR,
  EVENT_ERROR,
};
