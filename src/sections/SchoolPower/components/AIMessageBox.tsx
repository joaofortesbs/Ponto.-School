
import React, { useState, useRef, useEffect } from 'react';

const AIMessageBox = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedMode, setSelectedMode] = useState('Agente IA');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleSend = () => {
    if (message.trim()) {
      console.log('Enviando mensagem:', message);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <style jsx>{`
        @keyframes borderGlow {
          0% {
            background-position: 0% 50%;
            transform: rotate(0deg);
          }
          25% {
            background-position: 100% 0%;
            transform: rotate(90deg);
          }
          50% {
            background-position: 100% 50%;
            transform: rotate(180deg);
          }
          75% {
            background-position: 0% 100%;
            transform: rotate(270deg);
          }
          100% {
            background-position: 0% 50%;
            transform: rotate(360deg);
          }
        }

        @keyframes rotatingLight {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .message-container {
          position: relative;
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          border-radius: 20px;
          padding: 2px;
          transition: all 0.3s ease;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 15px 30px rgba(0, 0, 0, 0.4),
            0 5px 15px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          width: 500px;
        }

        .message-container.typing {
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          box-shadow: 
            0 30px 60px rgba(255, 107, 53, 0.2),
            0 20px 40px rgba(255, 107, 53, 0.15),
            0 10px 20px rgba(255, 107, 53, 0.12),
            0 5px 15px rgba(255, 107, 53, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .message-container.typing::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 28px;
          background: conic-gradient(
            from 0deg,
            rgba(255, 107, 53, 0.3),
            rgba(247, 147, 30, 0.3),
            rgba(255, 179, 71, 0.3),
            rgba(255, 140, 66, 0.3),
            rgba(255, 107, 53, 0.3)
          );
          animation: rotatingLight 1.5s linear infinite reverse, pulseGlow 3s ease infinite;
          z-index: -1;
          filter: blur(15px);
        }

        .message-container.typing::after {
          content: '';
          position: absolute;
          inset: -12px;
          border-radius: 32px;
          background: conic-gradient(
            from 0deg,
            rgba(255, 107, 53, 0.15),
            rgba(247, 147, 30, 0.15),
            rgba(255, 179, 71, 0.15),
            rgba(255, 140, 66, 0.15),
            rgba(255, 107, 53, 0.15)
          );
          animation: rotatingLight 3s linear infinite, pulseGlow 4s ease infinite;
          z-index: -2;
          filter: blur(20px);
        }

        .inner-container {
          background: linear-gradient(145deg, #1e1e1e, #2a2a2a);
          border-radius: 18px;
          padding: 20px;
          border: 1px solid #333;
          transition: all 0.3s ease;
        }

        .typing .inner-container {
          border-color: #ff6b35;
          box-shadow: 
            inset 0 1px 0 rgba(255, 107, 53, 0.2),
            0 0 20px rgba(255, 107, 53, 0.15);
        }

        .textarea-custom {
          background: transparent;
          border: none;
          color: #e0e0e0;
          font-size: 16px;
          line-height: 1.5;
          resize: none;
          outline: none;
          width: 100%;
          min-height: 24px;
          max-height: 200px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          caret-color: #ff6b35;
        }

        .textarea-custom::placeholder {
          color: #999;
          font-style: italic;
        }

        .action-button {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border: none;
          border-radius: 50%;
          color: white;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
        }

        .voice-button {
          background: linear-gradient(135deg, #666, #888);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .voice-button:hover {
          background: linear-gradient(135deg, #777, #999);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .file-button {
          background: linear-gradient(135deg, #444, #666);
          border: none;
          border-radius: 50%;
          color: #ccc;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .file-button:hover {
          background: linear-gradient(135deg, #555, #777);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .mode-selector {
          position: relative;
          display: inline-block;
        }

        .mode-button {
          background: linear-gradient(135deg, #333, #555);
          border: 1px solid #444;
          border-radius: 20px;
          color: #ccc;
          padding: 8px 16px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .mode-button:hover {
          background: linear-gradient(135deg, #444, #666);
          border-color: #555;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .mode-dropdown {
          position: absolute;
          bottom: 100%;
          left: 0;
          background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
          border: 1px solid #555;
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 12px;
          min-width: 180px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.6),
            0 10px 20px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 107, 53, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .mode-option {
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #ccc;
          font-size: 13px;
          font-weight: 500;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
          position: relative;
          overflow: hidden;
        }

        .mode-option:last-child {
          margin-bottom: 0;
        }

        .mode-option::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 12px;
        }

        .mode-option:hover::before {
          opacity: 1;
        }

        .mode-option:hover {
          color: #ff6b35;
          transform: translateX(4px);
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
        }

        .mode-option.active {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          border: 1px solid #ff6b35;
          box-shadow: 
            0 6px 16px rgba(255, 107, 53, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .mode-option.active::before {
          opacity: 0;
        }

        .mode-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .mode-option:hover .mode-icon {
          transform: scale(1.1);
        }

        .mode-option.active .mode-icon {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .dropdown-arrow {
          transition: transform 0.3s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .tech-accent {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #ff6b35;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .typing .tech-accent {
          opacity: 1;
          animation: pulseGlow 1.5s ease infinite;
        }
      `}</style>

      <div className={`message-container ${isTyping || isFocused ? 'typing' : ''}`}>
        <div className="tech-accent"></div>
        <div className="inner-container">
          <div className="flex flex-col gap-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Digite sua mensagem para a IA..."
                className="textarea-custom"
                rows={1}
              />
            </div>
            <div className="flex gap-3 items-center justify-between">
              <div className="mode-selector">
                <button
                  className="mode-button"
                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                >
                  {selectedMode === 'Agente IA' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {selectedMode}
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    className={`dropdown-arrow ${showModeDropdown ? 'open' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {showModeDropdown && (
                  <div className="mode-dropdown">
                    <button
                      className={`mode-option ${selectedMode === 'Agente IA' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedMode('Agente IA');
                        setShowModeDropdown(false);
                      }}
                    >
                      <svg className="mode-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Agente IA
                    </button>
                    <button
                      className={`mode-option ${selectedMode === 'Assistente IA' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedMode('Assistente IA');
                        setShowModeDropdown(false);
                      }}
                    >
                      <svg className="mode-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Assistente IA
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 items-center">
                <button className="file-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleSend}
                  className={`action-button ${message.trim() ? '' : 'voice-button'}`}
                >
                  {message.trim() ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 10V12C19 16.4183 15.4183 20 11 20H13C17.4183 20 21 16.4183 21 12V10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 20V23"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIMessageBox;
