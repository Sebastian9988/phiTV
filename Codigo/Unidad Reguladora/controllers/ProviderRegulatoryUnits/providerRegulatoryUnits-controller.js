const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
const { extract } = require("./extract-providerRegulatoryUnits-get-all-filters");

/* get config */
const config = require("config");
const routes = config.get("webServer.routes");

var providerRegulatoryUnitsLogic;

const startProviderRegulatoryUnitsRoutes = async function startProviderRegulatoryUnitsRoutes(router, logic) {
  providerRegulatoryUnitsLogic = logic;
  router.delete(routes.providerRegulatoryUnits_id, async function (req, res) {
    try {
      let id = req.params.id;
      await providerRegulatoryUnitsLogic.remove(id);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.delete(routes.providerRegulatoryUnits_name, async function (req, res) {
    try {
      let name = req.params.name;
      await providerRegulatoryUnitsLogic.removeByName(name);
      return res.status(HttpErrorCodes.HTTP_200_OK).send({});
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.providerRegulatoryUnits, async function (req, res) {
    try {
      const filter = extract(req);
      let providerRegulatoryUnits = await providerRegulatoryUnitsLogic.getAll(filter);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(providerRegulatoryUnits));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.get(routes.providerRegulatoryUnits_name, async function (req, res) {
    try {
      let name = req.params.name;
      let aProviderRegulatoryUnit = await providerRegulatoryUnitsLogic.get(name);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(aProviderRegulatoryUnit));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.post(routes.providerRegulatoryUnits, async function (req, res) {
    try {
      let aProviderRegulatoryUnit = req.body;
      let newProviderRegulatoryUnit = await providerRegulatoryUnitsLogic.create(aProviderRegulatoryUnit);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(newProviderRegulatoryUnit);
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.put(routes.providerRegulatoryUnits_id, async function (req, res) {
    try {
      let id = req.params.id;
      let aProviderRegulatoryUnit = req.body;
      let providerRegulatoryUnitUpdated = await providerRegulatoryUnitsLogic.update(id, aProviderRegulatoryUnit);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(providerRegulatoryUnitUpdated);
    } catch (err) {
      return evalException(err, res);
    }
  });
};

module.exports = {
  startProviderRegulatoryUnitsRoutes,
};
