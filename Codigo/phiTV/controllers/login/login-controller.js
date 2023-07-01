const { HttpErrorCodes } = require("../../exceptions/exceptions");
const { evalException } = require("../../exceptions/exceptions");
require('dotenv').config
const { ADMINISTRATOR, PROVIDER, CLIENT } = require("../../common/constants");

/* get config */
const config = require("config");
const routes = config.get("webServer.routes");
const jwt = require('jsonwebtoken')

var loginLogic;

const startLoginRoutes = async function startLoginRoutes(router, logic) {
  loginLogic = logic;

  router.post(routes.loginAdmins, async function (req, res) {
    try {
      const { userName, password } = req.body;
      let credentials = {
        userName: userName,
        password: password,
      };
      let token = await loginLogic.login(credentials, ADMINISTRATOR);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(token));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.post(routes.loginProviders, async function (req, res) {
    try {
      const { userName, password } = req.body;
      let credentials = {
        userName: userName,
        password: password,
      };
      let token = await loginLogic.login(credentials, PROVIDER);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(token));
    } catch (err) {
      return evalException(err, res);
    }
  });

  router.post(routes.loginClients, async function (req, res) {
    try {
      const { userName, password } = req.body;
      let credentials = {
        userName: userName,
        password: password,
      };
      let token = await loginLogic.login(credentials, CLIENT);
      return res.status(HttpErrorCodes.HTTP_200_OK).send(JSON.stringify(token));
    } catch (err) {
      return evalException(err, res);
    }
  });

  // router.post('/auth/admin', (req, res) => {
  //   const {username, password} = req.body;

  //   //consultar a la BD y validar que existen username y password

  //   const user = {username: username}; //aca puedo guardar informacion adicional (puede ser que el rol del usuario)

  //   const accessToken = generateAccessToken(user);

  //   res.header('authorization', accessToken).json({
  //     message: 'Usuario autenticado',
  //     token: accessToken
  //   })

  // });

  // function generateAccessToken(user){
  //   return jwt.sign(user, process.env.PRIVATE_KEY, {expiresIn: '5m'})
  // }
};

module.exports = {
  startLoginRoutes,
};
