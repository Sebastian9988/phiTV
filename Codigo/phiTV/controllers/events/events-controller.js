const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { extract } = require("./extract-events-get-all-filters");
const { validateToken } = require("../../common/auth-token");
require('dotenv').config
const { PROVIDER, CLIENT } = require("../../common/constants");

/* get config */
const config = require("config");
const routes = config.get("webServer.routes");

var eventsLogic;

const startEventsRoutes = async function startEventsRoutes(router, logic) {
  eventsLogic = logic;
  router.delete(routes.events_id, async function (req, res) {
    try {
      let id = req.params.id;
      await eventsLogic.remove(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.events, async function (req, res) {
    try {
      const filter = extract(req);
      let events = await eventsLogic.getAll(filter);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(events));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.approved_events, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(CLIENT)) {
        let events = await eventsLogic.getAllApproved();
        return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(events));
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });


  router.get(routes.events_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aEvent = await eventsLogic.get(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(aEvent));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.eventInfo_id, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(PROVIDER)) {
        let id = req.params.id;
        let aEvent = await eventsLogic.getEventInfo(id);
        return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(aEvent));
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.post(routes.events, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(PROVIDER)) {
        let aEvent = req.body;
        let newEvent = await eventsLogic.create(aEvent);
        return res.status(HttpErrorCodes.HTTP_200_OK).send(newEvent);
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.put(routes.events_id, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(PROVIDER)) {
        let id = req.params.id;
        let aEvent = req.body;
        let eventUpdated = await eventsLogic.update(id, aEvent);
        return res.status(HttpErrorCodes.HTTP_200_OK).send(eventUpdated);
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.put(routes.eventsSuscribe_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aSubscription = req.body;
      let eventUpdated = await eventsLogic.updateSubscriptions(id, aSubscription);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(eventUpdated);
    } catch (err) {
      return evalException(err, res);
    }
  });
};

module.exports = {
  startEventsRoutes,
};
