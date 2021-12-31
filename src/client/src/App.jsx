import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import Authenticate from "./components/authenticate";
import Messenger from "./components/messenger";

function App() {
  const socketRef = useRef();
  const [user, setUser] = useState({ loggedIn: false });

  const handleAuthenticated = (user) => {
    setUser({ ...user, loggedIn: true });
  };

  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:${window.location.port}`);
    socket.once("authenticated", handleAuthenticated);
    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (user.loggedIn) {
      // listen for welcome from server allowing us to reauth if needed
      socketRef.current.on("welcome", () => {
        socketRef.current.emit("login", user);
      });
    }
  }, [user]);

  return (
    <div className="text-center h-screen">
      {user.loggedIn ? <Messenger socket={socketRef} user={user} /> : <Authenticate socket={socketRef} />}
    </div>
  );
}

export default App;
