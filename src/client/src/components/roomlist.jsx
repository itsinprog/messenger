function RoomList({ rooms, joinRoom, activeRoom }) {
  console.log(rooms);
  return (
    <div className="float-left w-1/4">
      {rooms.map((room) => (
        <div className="px-2">
          <button
            className={`w-full font-semibold py-2 px-4 border border-blue-500 rounded my-1 ${
              activeRoom === room.id
                ? "bg-blue-500 text-white"
                : "bg-transparent text-blue-700 hover:bg-blue-500 hover:text-white hover:border-transparent"
            }`}
            onClick={() => joinRoom(room.id, activeRoom)}
          >
            {room.unreadCount > 0 && <span class="inline-block w-2 h-2 mr-2 bg-red-600 rounded-full"></span>}
            <span>{room.name}</span>
          </button>
        </div>
      ))}
      <button
        className={`w-full font-semibold py-2 px-4 rounded my-1 bg-transparent text-blue-700`}
        onClick={() => joinRoom(null)}
      >
        Create Room
      </button>
    </div>
  );
}

export default RoomList;
