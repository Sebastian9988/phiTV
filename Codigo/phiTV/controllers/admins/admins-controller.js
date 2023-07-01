const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { extract } = require("./extract-admins-get-all-filters");
const { ADMINISTRATOR } = require("../../common/constants");
const { validateToken } = require("../../common/auth-token");

/* get config */
const config = require("config");
const routes = config.get("webServer.routes");

var adminsLogic;

const startAdminsRoutes = async function startAdminsRoutes(router, logic) {
  adminsLogic = logic;
  router.delete(routes.admins_id, async function (req, res) {
    try {
      let id = req.params.id;
      await adminsLogic.remove(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.admins, async function (req, res) {
    try {
      const filter = extract(req);
      let admins = await adminsLogic.getAll(filter);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(admins));
    } catch (err) {
      return evalException(err, res);
    }
  });

  const createQueryResponse = ({activeEvents, queryRequestTimeStamp, queryResponseTimeStamp}) => {
    const queryProcessingTime = queryResponseTimeStamp - queryRequestTimeStamp;
    return {
      ...activeEvents,
      "Query Request TimeStamp": queryRequestTimeStamp,
      "Query Response TimeStamp": queryResponseTimeStamp,
      "Query processing Time": `${queryProcessingTime}ms`,
    };
  }

  router.get(routes.adminsActiveEvents, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(ADMINISTRATOR)) {
        const queryRequestTimeStamp = new Date();
        let activeEvents = await adminsLogic.getAllActiveEvents();
        const queryResponseTimeStamp = new Date();
        const response = createQueryResponse({activeEvents, queryRequestTimeStamp, queryResponseTimeStamp});
        return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(response));
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.adminsActiveAllEvents, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(ADMINISTRATOR)) {
        const queryRequestTimeStamp = new Date();
        const {from, to} = req.query;
        let activeEvents = await adminsLogic.getAllActiveEventsFromTo({from, to});
        const queryResponseTimeStamp = new Date();
        const response = createQueryResponse({activeEvents, queryRequestTimeStamp, queryResponseTimeStamp});
        return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(response));
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.admins_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aAdmin = await adminsLogic.get(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(aAdmin));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.adminsQuerys, async function (req, res) {
    try {
      let aAdmin = await adminsLogic.getAllQuerys();
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(aAdmin));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.delete(routes.adminsQuerys_id, async function (req, res) {
    try {
      let id = req.params.id;
      await adminsLogic.removeQuery(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.post(routes.admins, async function (req, res) {
    try {
      let aAdmin = req.body;
      aAdmin.userType = ADMINISTRATOR;
      let newAdmin = await adminsLogic.create(aAdmin);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(newAdmin);
    } catch (err) {
      return evalException(err, res);
    }
  });
  
  router.post(routes.adminsQuerys, async function (req, res) {
    try {
      let query = req.body;
      let newQuery = await adminsLogic.createQuery(query);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(newQuery);
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.put(routes.admins_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aAdmin = req.body;
      let adminUpdated = await adminsLogic.update(id, aAdmin);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(adminUpdated);
    } catch (err) {
      return evalException(err, res);
    }
  });
};

module.exports = {
  startAdminsRoutes,
};
