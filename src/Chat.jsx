import React from 'react'
import './Chat'

const Chat = () => {
  return (
    <div className="chat-app">
    {/* Chat Sidebar */}
    <div className="chat-sidebar">
      <h2>Available Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.chat_id}
            className={activeChat === chat.chat_id ? 'active' : ''}
            onClick={() => setActiveChat(chat.chat_id)}
          >
            Chat ID: {chat.chat_id}
          </li>
        ))}
      </ul>
    </div>

    {/* Chat Window */}
    <div className="chat-window">
      {activeChat && (
        <>
          <h2>Chat: {activeChat}</h2>

          {/* Messages Display */}
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={message.sender_id === userId ? 'message sent' : 'message received'}
              >
                {message.content}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  </div>
  )
}

export default Chat;