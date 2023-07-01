const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { extract } = require("./extract-logs-get-all-filters");
const { validateToken } = require("../../common/auth-token");
const { ADMINISTRATOR } = require("../../common/constants");

/* get config */
const config = require("config");
const routes = config.get("webServer.routes");

var logsLogic;

const startLogsRoutes = async function startLogsRoutes(router, logic) {
  logsLogic = logic;
  
  router.get(routes.logs, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(ADMINISTRATOR)) {
        const {from, to} = req.query;
        let logs = await logsLogic.getAll({from, to});
        return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(logs));
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.delete(routes.logs, async function (req, res) {
    try {
      await logsLogic.deleteAll();
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });
  
};

module.exports = {
  startLogsRoutes,
};
