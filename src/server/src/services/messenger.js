const { Room, Message, sequelize } = require("../models");

class MessagerService {
  static createRoom(roomName, members) {
    return Room.create({
      name: roomName,
      members: [members.map((member) => ({ id: member }))]
    }).then((result) => {
      return Room.findByPk(result.dataValues.id).then((room) => {
        return room.setUsers(members).then((roomMembers) => {
          return result;
        });
      });
    });
  }

  static gatherRooms(userId) {
    return Room.findAll({
      include: [
        {
          model: sequelize.models.User,
          where: {
            id: userId
          }
        }
      ]
    }).then((result) => {
      return result.map((res) => res.dataValues);
    });
  }

  static verifyInRoom(userId, roomId) {
    return Room.findAll({
      include: [
        {
          model: sequelize.models.User,
          where: {
            id: userId
          }
        }
      ],
      where: {
        id: roomId
      }
    }).then((result) => {
      return result.length > 0;
    });
  }

  static createMessage(message, roomId, userId) {
    return Message.create({
      message,
      sentBy: userId,
      RoomId: roomId
    }).then((result) => {
      return result.dataValues;
    });
  }

  static editMessage(userId, messageId, message) {
    return Message.update(
      {
        message
      },
      {
        where: {
          id: messageId,
          sentBy: userId
        }
      }
    ).then(() => {
      return Message.findByPk(messageId).then((res) => {
        return res.dataValues;
      });
    });
  }

  static deleteMessage(userId, messageId) {
    return Message.findByPk(messageId).then((res) => {
      const record = res.dataValues;
      if (record.sentBy === userId) {
        return res.destroy().then(() => {
          return record;
        });
      }
    });
  }

  static gatherMessages(roomId) {
    return Message.findAll({
      where: {
        RoomId: roomId
      },
      order: [["createdAt", "desc"]]
    }).then((result) => {
      return result.map((res) => res.dataValues);
    });
  }
}

module.exports = MessagerService;
