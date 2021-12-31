module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      message: DataTypes.STRING(2048),
      sentBy: DataTypes.INTEGER
    },
    {
      tableName: "messages",
      timestamps: true,
      indexes: [
        {
          using: "BTREE",
          fields: ["RoomId"]
        }
      ]
    }
  );
  Message.associate = (models) => {
    Message.belongsTo(models.Room);
  };
  return Message;
};
