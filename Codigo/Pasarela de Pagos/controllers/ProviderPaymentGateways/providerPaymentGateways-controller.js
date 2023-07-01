const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { extract } = require("./extract-providerPaymentGateways-get-all-filters");

/* get config */
const config = require("config");
const routes = config.get("webServer.routes");

var providerPaymentGatewaysLogic;

const startProviderPaymentGatewaysRoutes = async function startProviderPaymentGatewaysRoutes(router, logic) {
  providerPaymentGatewaysLogic = logic;
  router.delete(routes.providerPaymentGateways_id, async function (req, res) {
    try {
      let id = req.params.id;
      await providerPaymentGatewaysLogic.remove(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.delete(routes.providerPaymentGateways_name, async function (req, res) {
    try {
      let name = req.params.name;
      await providerPaymentGatewaysLogic.removeByName(name);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.providerPaymentGateways, async function (req, res) {
    try {
      const filter = extract(req);
      let providerPaymentGateways = await providerPaymentGatewaysLogic.getAll(filter);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(providerPaymentGateways));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.providerPaymentGateways_name, async function (req, res) {
    try {
      let name = req.params.name;
      let aProviderPaymentGateway = await providerPaymentGatewaysLogic.get(name);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(aProviderPaymentGateway));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.providersWhoHavePaid, async function (req, res) {
    try {
      const filter = extract(req);
      let providersThatHavePaid = await providerPaymentGatewaysLogic.getProvidersThatHavePaid(filter);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(providersThatHavePaid));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.post(routes.providerPaymentGateways, async function (req, res) {
    try {
      let aProviderPaymentGateway = req.body;
      let newProviderPaymentGateway = await providerPaymentGatewaysLogic.create(aProviderPaymentGateway);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(newProviderPaymentGateway);
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.put(routes.providerPaymentGateways_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aProviderPaymentGateway = req.body;
      let providerPaymentGatewayUpdated = await providerPaymentGatewaysLogic.update(id, aProviderPaymentGateway);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(providerPaymentGatewayUpdated);
    } catch (err) {
      return evalException(err, res);
    }
  });
};

module.exports = {
  startProviderPaymentGatewaysRoutes,
};
