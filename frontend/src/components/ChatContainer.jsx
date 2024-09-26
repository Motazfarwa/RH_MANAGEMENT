import React, { useEffect, useState, useContext } from "react";
import { FaYoutube } from "react-icons/fa6";
import ChatLists from "./ChatLists";
import InputText from "./InputText";
import UserLogin from "./UserLogin";
import socketIOClient from "socket.io-client";
import { useAuthContext } from '../contexts/AuthContext'; // Import AuthContext

const ChatContainer = () => {
  const { user, setUser } = useAuthContext(); // Use context instead of local state
  const socketio = socketIOClient("http://localhost:4000");
  const [chats, setChats] = useState([]);

  useEffect(() => {
    socketio.on("chat", (chats) => {
      setChats(chats);
    });

    socketio.on('message', (msg) => {
      setChats((prevChats) => [...prevChats, msg]);
    });

    return () => {
      socketio.off('chat');
      socketio.off('message');
    };
  }, []);

  const addMessage = (chat) => {
    const newChat = {
      username: user.FullName, // Get FullName from AuthContext
      message: chat,
   
    };
    socketio.emit('newMessage', newChat);
  };

  const Logout = () => {
    localStorage.removeItem("token");  // Clear token when logging out
    localStorage.removeItem("avatar");
    localStorage.removeItem("FullName");
    localStorage.removeItem("userRole");
    setUser(null);  // Clear the user in AuthContext
  };

  return (
    <div>
      {user ? ( // Check if the user is logged in through the context
        <div className="home">
          <div className="chats_header">
            <h4>Username: {user.FullName}</h4> {/* Display FullName from context */}
          
            <p className="chats_logout" onClick={Logout}>
              <strong>Logout</strong>
            </p>
          </div>
          <ChatLists chats={chats} />
          <InputText addMessage={addMessage} />
        </div>
      ) : (
        <UserLogin setUser={setUser} /> // Show login screen if no user
      )}
    </div>
  );
};

export default ChatContainer;
