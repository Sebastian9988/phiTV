const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { extract } = require("./extract-authorizations-get-all-filters");
const axios = require('axios');
const cron = require('node-cron');
const Authorization = require("../../data-access/data-access-mongo/Models/Authorizations");
const Admin = require("../../data-access/data-access-mongo/Models/Admins");
const Event = require("../../data-access/data-access-mongo/Models/Events");
const Provider = require("../../data-access/data-access-mongo/Models/Providers");
const { validateToken } = require("../../common/auth-token");
const { ADMINISTRATOR } = require("../../common/constants");
const config = require("config");
const routes = config.get("webServer.routes");
const automaticTimeForEventsPending = config.get("automaticTimeForEventsPending");
const automaticTimeAuthorizePendingEvents = config.get("automaticTimeAuthorizePendingEvents");
const automaticTimeUnauthorizePendingEvents = config.get("automaticTimeUnauthorizePendingEvents");

const IS_AUTOMATIC = true;
var authorizationsLogic;

const startAuthorizationsRoutes = async function startAuthorizationsRoutes(router, logic) {
  authorizationsLogic = logic;

  cron.schedule(automaticTimeAuthorizePendingEvents, () => {
    authorizationsLogic.authorizePendingEvents();
    console.log(`PASO ESTE TIEMPO EN LA AUTORIZACION: ${automaticTimeAuthorizePendingEvents}`);
  });

  cron.schedule(automaticTimeUnauthorizePendingEvents, () => {
    authorizationsLogic.unauthorizeAutomaticEvents();
    console.log(`PASO ESTE TIEMPO EN LA DESAUTORIZACION: ${automaticTimeUnauthorizePendingEvents}`);
  });

  cron.schedule(automaticTimeForEventsPending, () => {
    authorizationsLogic.collectEventsToSendMail();
    console.log(`PASO ESTE TIEMPO PARA LOS EVENTOS PENDIENTES: ${automaticTimeForEventsPending}`);
   });

  router.delete(routes.authorization_id, async function (req, res) {
    try {
      let id = req.params.id;
      await authorizationsLogic.remove(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.post(routes.authorization, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(ADMINISTRATOR)) {
        const aAuthorization = req.body;
        aAuthorization.automaticAuthorization = false;  
        const {newAuthorization} = await authorizationsLogic.create(aAuthorization, !IS_AUTOMATIC);
        return res.status(HttpErrorCodes.HTTP_200_OK).send(newAuthorization);
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.authorization, async function (req, res) {
    try {
      const filter = extract(req);
      let authorizations = await authorizationsLogic.getAll(filter);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(authorizations));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.unauthorization, async function (req, res) {
    try {
      const filter = extract(req);
      let authorizations = await authorizationsLogic.getAllUnautorized(filter);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(authorizations));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.delete(routes.unauthorization_id, async function (req, res) {
    try {
      let id = req.params.id;
      await authorizationsLogic.removeUnauthorization(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

};

module.exports = {
    startAuthorizationsRoutes,
};
