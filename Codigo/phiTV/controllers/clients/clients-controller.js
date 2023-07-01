const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { extract } = require("./extract-clients-get-all-filters");
const { validateToken } = require("../../common/auth-token");
require("dotenv").config();
const { CLIENT } = require("../../common/constants");

/* get config */
const config = require("config");
const routes = config.get("webServer.routes");
const TRANSMITION_PORT = process.env.TRANSMITION_PORT || "3300";

var clientsLogic;

const startClientsRoutes = async function startClientsRoutes(router, logic) {
  clientsLogic = logic;
  router.delete(routes.clients_id, async function (req, res) {
    try {
      let id = req.params.id;
      await clientsLogic.remove(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.clients, async function (req, res) {
    try {
      const filter = extract(req);
      let clients = await clientsLogic.getAll(filter);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(clients));
    } catch (err) {
      return evalException(err, res);
    }
  });

  const createQueryResponse = ({clients, queryRequestTimeStamp, queryResponseTimeStamp}) => {
    const queryProcessingTime = queryResponseTimeStamp - queryRequestTimeStamp;
    return {
      clients,
      "Query Request TimeStamp": queryRequestTimeStamp,
      "Query Response TimeStamp": queryResponseTimeStamp,
      "Query processing Time": `${queryProcessingTime}ms`,
    };
  }

  router.get(routes.clientsEvents, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(CLIENT)) {
        const queryRequestTimeStamp = new Date();
        let clients = await clientsLogic.getEventsInformation();
        console.log('clients', clients)
        const queryResponseTimeStamp = new Date();
        const response = createQueryResponse({clients, queryRequestTimeStamp, queryResponseTimeStamp});
        return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(response));
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.transmition, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(CLIENT)) {
        const clientId = req.query.clientId;
        const eventId = req.query.eventId;
        await clientsLogic.seeTransmition(clientId, eventId);
        return res.redirect(`http://localhost:${TRANSMITION_PORT}`);
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.clients_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aClient = await clientsLogic.get(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(aClient));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.post(routes.clients, async function (req, res) {
    try {
      let aClient = req.body;
      aClient.userType = CLIENT;
      let newClient = await clientsLogic.create(aClient);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(newClient);
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.put(routes.clients_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aClient = req.body;
      let clientUpdated = await clientsLogic.update(id, aClient);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(clientUpdated);
    } catch (err) {
      return evalException(err, res);
    }
  });
};

module.exports = {
  startClientsRoutes,
};
