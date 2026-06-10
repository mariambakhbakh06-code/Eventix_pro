// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';

const Chatbot = ({ userEmail = null, onClose = null }) => {
  const [messages, setMessages] = useState([
    { text: "👋 Hi! I'm your event assistant. I can help you find and book events in Morocco!\n\nWhat would you like to do?\n🔍 Find events\n🎫 Book tickets\n❓ Get help", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef('session_' + Date.now() + '_' + Math.random());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          sessionId: sessionId.current,
          userEmail: userEmail
        }),
      });
      
      const data = await response.json();
      
      setTimeout(() => {
        setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
        setIsTyping(false);
      }, 300);
      
    } catch (error) {
      console.error('Chat error:', error);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: '❌ Error connecting to server. Please make sure the backend is running on port 5000.', 
          sender: 'bot' 
        }]);
        setIsTyping(false);
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { text: "👋 Chat cleared! How can I help you today?", sender: 'bot' }
    ]);
  };

  return (
    // Main container - NO positioning here, just the chat box styling
    <div style={{
      width: '380px',
      height: '550px',
      background: 'white',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '14px 16px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎫</span> Event Assistant
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', opacity: 0.9 }}>
            {userEmail ? `✅ Signed in` : '🔐 Sign in to book'}
          </p>
        </div>
        <button
          onClick={clearChat}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
          }}
        >
          Clear
        </button>
      </div>
      
      {/* Messages Container - This scrolls */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px',
        background: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.sender === 'user' ? '#667eea' : 'white',
              color: msg.sender === 'user' ? 'white' : '#333',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              whiteSpace: 'pre-line',
              fontSize: '13px',
              lineHeight: '1.4'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'white', padding: '10px 14px', borderRadius: '16px' }}>
              <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div style={{ 
        padding: '12px', 
        borderTop: '1px solid #e0e0e0', 
        background: 'white',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            style={{ 
              flex: 1, 
              padding: '10px 14px', 
              borderRadius: '20px', 
              border: '1px solid #ddd',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            style={{ 
              padding: '10px 20px', 
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <div style={{ 
          fontSize: '10px', 
          color: '#999', 
          marginTop: '8px',
          textAlign: 'center'
        }}>
          {userEmail ? '💬 Type "book" to book tickets' : '🔐 Sign in to book tickets'}
        </div>
      </div>

      <style>
        {`
          .dot {
            display: inline-block;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #999;
            margin: 0 2px;
            animation: typing 1.4s infinite;
          }
          
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }
          
          @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-6px); opacity: 1; }
          }
          
          /* Custom scrollbar */
          div::-webkit-scrollbar {
            width: 5px;
          }
          
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          div::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 5px;
          }
        `}
      </style>
    </div>
  );
};

export default Chatbot;