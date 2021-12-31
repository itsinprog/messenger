const path = require("path");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
const redis = require("socket.io-redis");
const { createClient } = require("redis");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { sequelize } = require("./src/models");
const AuthenticationService = require("./src/services/authentication");
const MessagerService = require("./src/services/messenger");
const config = require("./src/config");

let pubClient;
if (config.redis.password) {
  pubClient = createClient(config.redis.port, config.redis.endpoint, { password: config.redis.password });
} else {
  pubClient = createClient(config.redis.port, config.redis.endpoint);
}
io.adapter(
  redis({
    pubClient,
    subClient: pubClient.duplicate()
  })
);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
  console.log("Socket connected");
  let authenticatedUser = null;
  socket.emit("welcome");

  socket.on("disconnect", () => {
    console.log("disconnected");
  });

  socket.on("login", (user) => {
    AuthenticationService.checkExistence(user.username)
      .then((foundUser) => {
        if (foundUser) {
          AuthenticationService.verifyUser(foundUser, user.password)
            .then((verified) => {
              if (verified) {
                authenticatedUser = verified;
                socket.emit("authenticated", { ...authenticatedUser, password: user.password });
                socket.join(authenticatedUser.id);
              }
            })
            .catch((err) => {
              console.error(err);
              socket.emit("authError", "Error occured when verifying user");
            });
        } else {
          AuthenticationService.registerUser(user.username, user.password)
            .then((registeredUser) => {
              authenticatedUser = registeredUser.dataValues;
              socket.emit("authenticated", { ...authenticatedUser, password: user.password });
              socket.join(authenticatedUser.id);
            })
            .catch((err) => {
              console.error(err);
              socket.emit("authError", "Error occured when registering user");
            });
        }
      })
      .catch((err) => {
        console.error(err);
        socket.emit("authError", "Error occured when checking existence");
      });
  });

  socket.on("getUsers", () => {
    if (authenticatedUser) {
      AuthenticationService.gatherUsers(authenticatedUser.id).then((users) => {
        socket.emit("users", users);
      });
    }
  });

  socket.on("createRoom", (roomObj) => {
    const { roomName, toUser } = roomObj;
    if (authenticatedUser) {
      MessagerService.createRoom(roomName, [authenticatedUser.id, toUser])
        .then(() => {
          // emit rooms to creator
          MessagerService.gatherRooms(authenticatedUser.id)
            .then((rooms) => {
              console.log("rooms for creator", rooms);
              io.to(authenticatedUser.id).emit("rooms", rooms);
            })
            .catch((err) => {
              console.error(err);
            });
          // emit rooms to reciever
          MessagerService.gatherRooms(toUser)
            .then((rooms) => {
              console.log("rooms for to user", rooms);
              io.to(Number(toUser)).emit("rooms", rooms);
            })
            .catch((err) => {
              console.error(err);
            });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  socket.on("getRooms", () => {
    if (authenticatedUser) {
      MessagerService.gatherRooms(authenticatedUser.id)
        .then((rooms) => {
          io.to(authenticatedUser.id).emit("rooms", rooms);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  socket.on("joinRoom", ({ roomId, priorRoomId }) => {
    if (authenticatedUser) {
      // ensure user is able to join room
      if (priorRoomId) {
        socket.leave(priorRoomId);
      }
      MessagerService.verifyInRoom(authenticatedUser.id, roomId)
        .then((inRoom) => {
          socket.join(roomId);
          if (inRoom) {
            MessagerService.gatherMessages(roomId)
              .then((messages) => {
                socket.emit("messages", messages);
              })
              .catch((err) => {
                console.error(err);
              });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  socket.on("sendMessage", ({ message, roomId }) => {
    if (authenticatedUser) {
      // ensure user is able to send to room
      MessagerService.verifyInRoom(authenticatedUser.id, roomId)
        .then((inRoom) => {
          if (inRoom) {
            MessagerService.createMessage(message, roomId, authenticatedUser.id).then((newMessage) => {
              io.to(roomId).emit("newMessage", newMessage);
            });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  socket.on("deleteMessage", (messageId) => {
    if (authenticatedUser) {
      // ensure user is able to send to room
      MessagerService.deleteMessage(authenticatedUser.id, messageId)
        .then((deletedMessage) => {
          if (deletedMessage) {
            MessagerService.gatherMessages(deletedMessage.RoomId)
              .then((messages) => {
                io.to(deletedMessage.RoomId).emit("messages", messages);
              })
              .catch((err) => {
                console.error(err);
              });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  socket.on("editMessage", ({ id, message }) => {
    if (authenticatedUser) {
      // ensure user is able to send to room
      MessagerService.editMessage(authenticatedUser.id, id, message)
        .then((updatedMessage) => {
          if (updatedMessage) {
            MessagerService.gatherMessages(updatedMessage.RoomId)
              .then((messages) => {
                io.to(updatedMessage.RoomId).emit("messages", messages);
              })
              .catch((err) => {
                console.error(err);
              });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });
});

sequelize
  .sync()
  .then(() => {
    console.log("Database connection established and models synced");
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, function () {
      console.log("Server listening at port %d", PORT);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
