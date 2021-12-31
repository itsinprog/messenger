module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "Room",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.TEXT
    },
    {
      tableName: "rooms",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["id"]
        }
      ]
    }
  );
  Room.associate = (models) => {
    Room.belongsToMany(models.User, { through: "members" });
    Room.hasMany(models.Message);
  };
  return Room;
};
