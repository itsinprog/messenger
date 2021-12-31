import { useEffect } from "react";

function SendInput({ socket, activeRoom, editMessage, setEditMessage }) {
  const sendMessage = (e) => {
    e.preventDefault();
    const message = document.getElementById("message");

    if (message.value) {
      if (editMessage) {
        socket.current.emit("editMessage", {
          message: message.value,
          id: editMessage.id
        });
        setEditMessage(null);
      } else {
        socket.current.emit("sendMessage", {
          message: message.value,
          roomId: activeRoom
        });
      }
      message.value = "";
    }
  };

  useEffect(() => {
    const message = document.getElementById("message");
    if (editMessage) {
      message.value = editMessage.message;
    } else {
      message.value = "";
    }
  }, [editMessage]);

  return (
    <form onSubmit={sendMessage}>
      {editMessage && (
        <>
          <p>
            <button type="button" onClick={() => setEditMessage(null)}>
              X
            </button>{" "}
            Editing message
          </p>
        </>
      )}
      <div class="relative mt-5 flex">
        <input
          id="message"
          type="text"
          placeholder="Type a message"
          class="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-3 bg-gray-200 rounded-l-lg py-3"
        />
        <div class="absolute right-0 items-center inset-y-0 hidden sm:flex">
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-r-lg h-12 w-12 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
}

export default SendInput;
