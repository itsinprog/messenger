module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: DataTypes.TEXT,
      password: DataTypes.TEXT
    },
    {
      tableName: "users",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["username"]
        }
      ]
    }
  );
  User.associate = (models) => {
    User.belongsToMany(models.Room, { through: "members" });
  };
  return User;
};
