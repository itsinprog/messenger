const { Sequelize } = require("sequelize");
const { db } = require("../config");
const fs = require("fs");
const path = require("path");

const basename = path.basename(__filename);

const sequelize = new Sequelize(db.name, db.username, db.password, {
  ...db,
  // logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

const models = {};

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js")
  .forEach((file) => {
    const modulePath = path.join(__dirname, file);
    const model = require(modulePath)(sequelize, Sequelize.DataTypes);
    models[model.name] = model;
  });

Object.keys(models).forEach(function (modelName) {
  if (models[modelName].associate) {
    console.log(models[modelName]);
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
