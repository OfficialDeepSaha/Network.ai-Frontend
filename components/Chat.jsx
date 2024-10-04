import React, { useState } from 'react';
import axios from 'axios';

function Chat() {
    const [userId, setUserId] = useState('');
    const [connectedUserId, setConnectedUserId] = useState('');
    const [chatSessionId, setChatSessionId] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const [messages, setMessages] = useState([]);

    const startChat = async () => {
        try {
            const response = await axios.post('http://localhost:8000/chats/start', { user_id: userId, connected_user_id: connectedUserId });
            setChatSessionId(response.data.chat_session_id);
            console.log('Chat started successfully');
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const sendMessage = async () => {
        if (chatSessionId && messageContent) {
            try {
                await axios.post('http://localhost:8000/chats/messages', {
                    chat_session_id: chatSessionId,
                    sender_id: userId,
                    content: messageContent,
                    timestamp: new Date().toISOString()
                });
                console.log('Message sent successfully');
                setMessages([...messages, { sender: 'Me', content: messageContent }]);
                setMessageContent('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    return (
        <div>
            <h2>AI Chat</h2>
            <input type="number" placeholder="Your User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            <input type="number" placeholder="Connected User ID" value={connectedUserId} onChange={(e) => setConnectedUserId(e.target.value)} />
            <button onClick={startChat}>Start AI Chat</button>
            {chatSessionId && (
                <>
                    <div>
                        <input type="text" placeholder="Type a message..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                    <div>
                        {messages.map((msg, index) => (
                            <div key={index}><strong>{msg.sender}:</strong> {msg.content}</div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default Chat;
