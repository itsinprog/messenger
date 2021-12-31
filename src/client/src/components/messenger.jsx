import { useEffect, useState } from "react";
import RoomChat from "./roomchat";
import RoomList from "./roomlist";
import CreateRoom from "./createroom";

function Messenger({ socket, user }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  socket.current.on("rooms", (rooms) => {
    console.log("rooms", rooms);
    setRooms(rooms);
  });

  useEffect(() => {
    socket.current.emit("getRooms");
  }, [socket]);

  const joinRoom = (roomId, priorRoomId) => {
    socket.current.emit("joinRoom", { roomId, priorRoomId });
    setActiveRoom(roomId);
  };

  return (
    <div className="flex">
      <RoomList rooms={rooms} joinRoom={joinRoom} activeRoom={activeRoom} />
      {activeRoom && <RoomChat socket={socket} user={user} activeRoom={activeRoom} />}
      {!activeRoom && <CreateRoom socket={socket} />}
    </div>
  );
}

export default Messenger;
