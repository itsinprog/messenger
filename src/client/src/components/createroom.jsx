import { useEffect, useState } from "react";

function CreateRoom({ socket }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.current.once("users", setUsers);
    socket.current.emit("getUsers");
  }, [socket]);

  const createRoom = () => {
    const roomName = document.getElementById("name");
    if (!roomName.value) {
      return alert("Please enter a room name");
    }

    const toUser = document.getElementById("toUser");
    if (!toUser.value) {
      return alert("Please select a recipient");
    }

    socket.current.emit("createRoom", {
      roomName: roomName.value,
      toUser: toUser.value
    });
  };

  return (
    <div className="w-full h-screen bg-gray-100 p-5">
      <div class="inline-block relative w-64">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
            Room Name
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Room Name"
          />{" "}
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="toUser">
            To
          </label>
          <select
            id="toUser"
            class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a user..</option>
            {users.map((user) => (
              <option value={user.id}>{user.username}</option>
            ))}
          </select>
        </div>
        <div class="w-full m-auto">
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => createRoom()}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;
