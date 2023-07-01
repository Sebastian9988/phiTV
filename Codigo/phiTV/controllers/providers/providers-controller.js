const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { extract } = require("./extract-providers-get-all-filters");
const { validateToken } = require("../../common/auth-token");
const { ADMINISTRATOR, PROVIDER } = require("../../common/constants");

/* get config */
const config = require("config");
const routes = config.get("webServer.routes");

var providersLogic;

const startProvidersRoutes = async function startProvidersRoutes(router, logic) {
  providersLogic = logic;
  router.delete(routes.providers_id, async function (req, res) {
    try {
      let id = req.params.id;
      await providersLogic.remove(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.providers, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(ADMINISTRATOR)) {
        const filter = extract(req);
        let providers = await providersLogic.getAll(filter);
        return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(providers));
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  const createQueryResponse = ({events, queryRequestTimeStamp, queryResponseTimeStamp}) => {
    const queryProcessingTime = queryResponseTimeStamp - queryRequestTimeStamp;
    return {
      ...events,
      "Query Request TimeStamp": queryRequestTimeStamp,
      "Query Response TimeStamp": queryResponseTimeStamp,
      "Query processing Time": `${queryProcessingTime}ms`,
    };
  }

  router.get(routes.providersEvents_id, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(PROVIDER)) {
        const queryRequestTimeStamp = new Date();
        let id = req.params.id;
        let events = await providersLogic.getEventInformationForProvider(id);
        const queryResponseTimeStamp = new Date();
        const response = createQueryResponse({events, queryRequestTimeStamp, queryResponseTimeStamp});
        return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(response));
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.providersAllEvents, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(PROVIDER)) {
        const queryRequestTimeStamp = new Date();
        let id = req.params.id;
        let events = await providersLogic.getAllEventsForProviders(id);
        const queryResponseTimeStamp = new Date();
        const response = createQueryResponse({events, queryRequestTimeStamp, queryResponseTimeStamp});
        return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(response));
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }

    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.providersAllEvents, async function (req, res) {
    try {
      const queryRequestTimeStamp = new Date();
      let id = req.params.id;
      let events = await providersLogic.getAllEventsForProviders(id);
      const queryResponseTimeStamp = new Date();
      const queryProcessingTime = queryResponseTimeStamp - queryRequestTimeStamp;
      const response = {
        ...events,
        "Query Request TimeStamp": queryRequestTimeStamp,
        "Query Response TimeStamp": queryResponseTimeStamp,
        "Query processing Time": `${queryProcessingTime}ms`,
      };
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(response));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.providers_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aEvent = await providersLogic.get(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(aEvent));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.post(routes.providers, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(ADMINISTRATOR)) {
        let aProvider = req.body;
        aProvider.userType = PROVIDER;
        let newProvider = await providersLogic.create(aProvider);
        return res.status(HttpErrorCodes.HTTP_200_OK).send(newProvider);
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.put(routes.providers_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aEvent = req.body;
      let eventUpdated = await providersLogic.update(id, aEvent);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(eventUpdated);
    } catch (err) {
      return evalException(err, res);
    }
  });
};

module.exports = {
  startProvidersRoutes,
};
