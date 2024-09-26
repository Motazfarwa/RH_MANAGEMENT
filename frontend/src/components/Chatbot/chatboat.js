import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Chatboat.css';  // For custom styling

const Chatboat = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to the latest message
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Initialize your Gemini API (Move the API key to backend for security)
  const genAI = new GoogleGenerativeAI( "AIzaSyCB974IeL-GRmRrwR3WDz1fCCn8cIDilZI",
);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Function to handle user input
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // Function to send user message to Gemini
  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setIsLoading(true);
    try {
      // Call Gemini API to get a response
      const result = await model.generateContent(userInput);
      const response = await result.response;

      // Add Gemini's response to the chat history
      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: await response.text() },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setUserInput("");
      setIsLoading(false);
    }
  };

  // Function to clear the chat history
  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <div className="chat-card-container">
      <div className="chat-card">
        <header className="chat-header">
          <h3>AI Assistant</h3>
        </header>
        <div className="chat-window">
          <div className="message-list">
            {chatHistory.map((item, index) => (
              <div key={index} className={`message-card ${item.type === "user" ? "user-message" : "ai-message"}`}>
                {item.message}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={userInput}
            onChange={handleUserInput}
            disabled={isLoading}
            className="message-input"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="send-button"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default Chatboat;
