import React, { useEffect, useRef, useState } from 'react';

const ChatLists = ({ chats }) => {
  const endOfMessages = useRef();
  
  // Use state to manage profile image and username
  const [senderImage, setSenderImage] = useState(localStorage.getItem('sender'));
  const [receiverImage, setReceiverImage] = useState(localStorage.getItem('receiver'));
  const [username, setUsername] = useState(localStorage.getItem('FullName'));

  // Update state when component mounts
  useEffect(() => {
    const senderImg = localStorage.getItem('sender');
    const receiverImg = localStorage.getItem('receiver');
    const userName = localStorage.getItem('FullName');
    
    // Only update if there's a change
    if (senderImg !== senderImage) {
        setSenderImage(senderImg);
    }
    if (receiverImg !== receiverImage) {
        setReceiverImage(receiverImg);
      }
    
    if (userName !== username) {
      setUsername(userName);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  function SenderChat({ message }) {
    return (
      <div className='chat_sender'>
        <img src={senderImage} alt="Sender's profile" />
        <p>
          <strong>{username}</strong> <br />
          {message}
        </p>
      </div>
    );
  }

  function ReceiverChat({ message, username }) {
    return (
      <div className='chat_receiver'>
        <img src={receiverImage} alt="Receiver's profile" />
        <p>
          <strong>{username}</strong> <br />
          {message}
        </p>
      </div>
    );
  }

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const scrollToBottom = () => {
    endOfMessages.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className='chats_list'>
      {chats.map((chat, index) => {
        if (chat.username === username) { // Compare with the username
          return (
            <SenderChat
              key={index}
              message={chat.message}
            />
          );
        } else {
          return (
            <ReceiverChat
              key={index}
              message={chat.message}
              username={chat.username}
              profileImage={chat.avatar} // Use chat's profileImage for receiver
            />
          );
        }
      })}
      <div ref={endOfMessages}></div>
    </div>
  );
};

export default ChatLists;
