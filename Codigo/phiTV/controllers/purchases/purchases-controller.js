const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { extract } = require("./extract-purchses-get-all-filters");
const { CLIENT } = require("../../common/constants");
const { validateToken } = require("../../common/auth-token");

/* get config */
const config = require("config");
const routes = config.get("webServer.routes");

var purchasesLogic;

const startPurchasesRoutes = async function startPurchasesRoutes(router, logic) {
  purchasesLogic = logic;

  router.post(routes.clientsPurchase_id, validateToken, async function (req, res) {
    try {
      if (req.user.permissions.includes(CLIENT)) {
        let clientId = req.params.id;
        let aEventToPurchase = req.body;
        let newPurchase = await purchasesLogic.createPurchase(clientId, aEventToPurchase.eventId);
        return res.status(HttpErrorCodes.HTTP_200_OK).send(newPurchase);
      } else {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Access denied. You do not have sufficient permissions.");
      }
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.clientsPurchase, async function (req, res) {
    try {
      const filter = extract(req);
      let purchases = await purchasesLogic.getAllPurchases(filter);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(purchases));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.delete(routes.purchase_id, async function (req, res) {
    try {
      let id = req.params.id;
      await purchasesLogic.removePurchase(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });
};

module.exports = {
  startPurchasesRoutes,
};
