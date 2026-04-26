import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api/medlife-api';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: 'Hello! I\'m your MedLife AI Health Assistant. How can I help you today? You can describe your symptoms or ask health-related questions.',
      suggestions: ['I have a headache', 'Check my symptoms', 'Find a doctor', 'Emergency help']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = { type: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Check if it's a symptom check request
      const isSymptomCheck = text.toLowerCase().includes('symptom') || 
                            text.toLowerCase().includes('pain') ||
                            text.toLowerCase().includes('fever') ||
                            text.toLowerCase().includes('headache');

      let response;
      if (isSymptomCheck) {
        response = await aiAPI.checkSymptoms({ symptoms: text, message: text });
        const analysis = response.data.analysis;
        
        setMessages(prev => [...prev, {
          type: 'ai',
          text: analysis.response,
          urgency: analysis.urgency_level,
          conditions: analysis.possible_conditions,
          specialists: analysis.suggested_specialists,
          suggestions: analysis.urgency_level === 'critical' 
            ? ['Call Emergency', 'Find Hospital'] 
            : ['Book Doctor', 'Learn More']
        }]);
      } else {
        response = await aiAPI.chat({ message: text });
        setMessages(prev => [...prev, {
          type: 'ai',
          text: response.data.response,
          suggestions: response.data.suggestions
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'ai',
        text: 'I apologize, but I\'m having trouble processing your request. Please try again or contact support.',
        suggestions: ['Try Again', 'Contact Support']
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return '#ff4757';
      case 'high': return '#ffa502';
      case 'medium': return '#ffa502';
      default: return '#00C9A7';
    }
  };

  return (
    <div className="ai-assistant">
      <div className="page-header">
        <div className="container">
          <h1>🤖 AI Health Assistant</h1>
          <p>Describe your symptoms and get instant health guidance</p>
        </div>
      </div>

      <div className="container">
        <div className="chat-container card">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.type}`}
              >
                <div className="message-avatar">
                  {message.type === 'ai' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  {message.urgency && (
                    <div 
                      className="urgency-badge"
                      style={{ backgroundColor: getUrgencyColor(message.urgency) }}
                    >
                      {message.urgency.toUpperCase()} PRIORITY
                    </div>
                  )}
                  
                  <p>{message.text}</p>
                  
                  {message.conditions && message.conditions.length > 0 && (
                    <div className="conditions-list">
                      <strong>Possible Conditions:</strong>
                      <ul>
                        {message.conditions.map((condition, i) => (
                          <li key={i}>{condition}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.specialists && message.specialists.length > 0 && (
                    <div className="specialists-list">
                      <strong>Suggested Specialists:</strong>
                      <div className="specialist-tags">
                        {message.specialists.map((specialist, i) => (
                          <span key={i} className="specialist-tag">{specialist}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="suggestion-chips">
                      {message.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          className="suggestion-chip"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message ai">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="quick-symptoms">
              <span>Common symptoms:</span>
              {['Fever', 'Headache', 'Cough', 'Stomach Pain', 'Chest Pain'].map(symptom => (
                <button
                  key={symptom}
                  className="quick-symptom-btn"
                  onClick={() => handleSend(`I have ${symptom.toLowerCase()}`)}
                >
                  {symptom}
                </button>
              ))}
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="chat-form">
              <input
                type="text"
                className="form-control"
                placeholder="Type your symptoms or question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </form>
            
            <p className="disclaimer">
              ⚠️ This AI assistant provides general health information only. 
              For emergencies, please call 108 or visit the nearest hospital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
