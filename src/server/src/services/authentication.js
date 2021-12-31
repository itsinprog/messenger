const { User, sequelize, Sequelize } = require("../../src/models");

class AuthenticationService {
  static checkExistence(username) {
    return User.findAll({
      where: {
        username: username
      }
    }).then((records) => {
      if (records.length > 0) {
        return records[0].dataValues;
      } else {
        return null;
      }
    });
  }

  static verifyUser(userRecord, password) {
    return User.findAll({
      where: {
        username: userRecord.username,
        password: sequelize.fn("crypt", password, sequelize.cast(userRecord.password, "varchar"))
      }
    }).then((records) => {
      if (records.length > 0) {
        return records[0].dataValues;
      }
    });
  }

  static registerUser(username, password) {
    return User.create({
      username: username,
      password: sequelize.fn("crypt", password, sequelize.fn("gen_salt", "bf"))
    })
      .then((record) => {
        return record;
      })
      .catch((err) => {
        console.log("create error", err);
      });
  }

  static gatherUsers(userId) {
    return User.findAll({
      where: {
        id: { [Sequelize.Op.ne]: userId }
      }
    }).then((records) => {
      return records.map((record) => record.dataValues);
    });
  }
}

module.exports = AuthenticationService;
