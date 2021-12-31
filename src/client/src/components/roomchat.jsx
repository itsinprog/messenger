import { useEffect, useState } from "react";
import SendInput from "./sendinput";

function DeleteButton({ className, onClick }) {
  return (
    <button
      class={"bg-grey-light hover:bg-grey text-grey-darkest font-bold rounded inline-flex items-center" + className}
      onClick={onClick}
    >
      <svg
        className="fill-red-500 mt-3"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="16"
        height="16"
        viewBox="0 0 24 24"
      >
        <path d="M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z"></path>
      </svg>
    </button>
  );
}

function EditButton({ className, onClick }) {
  return (
    <button
      class={"bg-grey-light hover:bg-grey text-grey-darkest font-bold rounded inline-flex items-center" + className}
      onClick={onClick}
    >
      <svg
        className="fill-gray-500 mt-3"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="16"
        height="16"
        viewBox="0 0 24 24"
      >
        {" "}
        <path d="M 18.414062 2 C 18.158062 2 17.902031 2.0979687 17.707031 2.2929688 L 15.707031 4.2929688 L 14.292969 5.7070312 L 3 17 L 3 21 L 7 21 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.926094 2.0979687 18.670063 2 18.414062 2 z M 18.414062 4.4140625 L 19.585938 5.5859375 L 18.292969 6.8789062 L 17.121094 5.7070312 L 18.414062 4.4140625 z M 15.707031 7.1210938 L 16.878906 8.2929688 L 6.171875 19 L 5 19 L 5 17.828125 L 15.707031 7.1210938 z"></path>
      </svg>
    </button>
  );
}

function RoomChat({ socket, activeRoom, user }) {
  const [messages, setMessages] = useState(null);
  const [editMessage, setEditMessage] = useState(null);

  useEffect(() => {
    // register handlers for new messages
    socket.current.on("messages", (socketMessages) => {
      setMessages(socketMessages);
    });

    socket.current.on("newMessage", (message) => {
      setMessages([message, ...(messages || [])]);
    });
  }, [socket, messages]);

  const deleteMessage = (messageId) => {
    socket.current.emit("deleteMessage", messageId);
  };

  if (messages === null) {
    return <></>;
  }

  return (
    <div className="w-full h-screen bg-gray-100 p-5">
      <div style={{ maxHeight: "90vh" }} className="flex flex-col-reverse overflow-scroll">
        {messages.map((message) => (
          <div className={`my-1 flex flex-row ${user.id === message.sentBy ? "justify-end" : "justify-start"}`}>
            <p>
              {user.id === message.sentBy && (
                <>
                  <span className="mr-5">{new Date(message.createdAt).toLocaleString()}</span>
                  <DeleteButton
                    className="py-2 pr-2"
                    onClick={() => {
                      deleteMessage(message.id);
                    }}
                  />
                  <EditButton
                    className="py-2 pr-2"
                    onClick={() => {
                      setEditMessage(message);
                    }}
                  />
                </>
              )}
              <span
                style={{ maxWidth: "35vw" }}
                className={`px-4 py-2 rounded-lg inline-block ${
                  user.id === message.sentBy
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-300 text-gray-600 rounded-bl-none"
                }`}
              >
                {message.message}
              </span>
              {user.id !== message.sentBy && (
                <span className="ml-5">{new Date(message.createdAt).toLocaleString()}</span>
              )}
            </p>
          </div>
        ))}
      </div>
      <SendInput socket={socket} activeRoom={activeRoom} editMessage={editMessage} setEditMessage={setEditMessage} />
    </div>
  );
}

export default RoomChat;
