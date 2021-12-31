module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Presence",
    {},
    {
      tableName: "presence"
    }
  );
};
