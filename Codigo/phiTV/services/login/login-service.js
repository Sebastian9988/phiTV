const { ElementNotFoundException } = require("../../exceptions/exceptions.js");
const { InvalidCredentials } = require("../../exceptions/exceptions.js");
const { validateCredentials } = require("./validate-login.js");
const { messageBinder } = require("./locale/locale-binder.js");
const { generateJWTUserPermissions } = require("../../common/jwt-token-generator.js");
const { hashing } = require("../../common/encrypt.js");
const { ADMINISTRATOR, PROVIDER, CLIENT } = require("../../common/constants");

const config = require("config");
var dbModels;
const Admin = require("../../data-access/data-access-mongo/Models/Admins.js");
const Provider = require("../../data-access/data-access-mongo/Models/Providers.js");
const Client = require("../../data-access/data-access-mongo/Models/Clients.js");

const setDbModels = async function (models) {
  dbModels = models;
};
const create = async function (anUser, t) {
  let credentials = {
    userId: anUser.userId,
    password: hashing(anUser.password),
  };

  let newCredentials = await dbModels.Credentials.create(credentials, { transaction: t });
  return newCredentials;
};

const verifyPassword = async (user, credentials) => {
  let hashedPassword = hashing(credentials.password);
  console.log(hashedPassword + " " + user.password);
  if (user.password != hashedPassword) {
    console.log(`[service: logic-login] [function: verifyPassword] [type:W] [data: password not match]`);
    throw new InvalidCredentials(messageBinder.notFound);
  }
};

const rolesToClaims = function (user) {
  let claims = [];
  if (user) {
    claims.push(user.userType);
  }
  return claims;
};


const login = async function (credentials, userType) {
  await validateCredentials(credentials);
  let user = await getUser(credentials.userName, userType);
  await verifyPassword(user, credentials);
  let token = await generateJWTUserPermissions(user, rolesToClaims(user));
  return token;
};


const getUser = async function (userName, userType) {
  let filter = {
    where: { userName: userName },
  };

  let user;
  if (userName) {
    switch (userType) {
      case PROVIDER:
        user = await Provider.findOne({ name: userName });
        break;
      case ADMINISTRATOR:
        user = await Admin.findOne({ userName: userName });
        break;
      case CLIENT:
        user = await Client.findOne({ name: userName });
        break;
      default:
        throw new Error("Invalid user type");
    }
  };


  if (!user) {
    console.log(
      `[service: logic-login] [function: getUser] [type:W] [data: user not exists ${JSON.stringify(filter)}]`
    );
    throw new ElementNotFoundException(messageBinder().notFound);
  }
  return user;
};

module.exports = {
  login,
  create,
  setDbModels,
};
