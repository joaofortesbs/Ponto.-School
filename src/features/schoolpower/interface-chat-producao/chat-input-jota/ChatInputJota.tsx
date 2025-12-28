/**
 * CHAT INPUT JOTA - Caixa de Input Dedicada para o Chat do Agente Jota
 * 
 * Componente independente da caixa de input do School Power principal.
 * Permite customizações específicas para o contexto do chat.
 */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame, useMotionTemplate } from "framer-motion";
import { Paperclip, Send, Loader2 } from 'lucide-react';

interface ChatInputJotaProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}

const MovingBorder = ({
  children,
  duration = 3000,
  rx = "20px",
  ry = "20px",
}: any) => {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x,
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y,
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
};

export function ChatInputJota({ 
  onSend, 
  isLoading = false, 
  isDisabled = false,
  placeholder = "Digite sua mensagem ou comando..."
}: ChatInputJotaProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading && !isDisabled) {
      onSend(trimmedMessage);
      setMessage("");
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const lineHeight = 20;
      const minHeight = 20;
      const maxHeight = 200;
      
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";
      const scrollHeight = textarea.scrollHeight;

      if (scrollHeight <= lineHeight) {
        textarea.style.height = minHeight + "px";
      } else if (scrollHeight <= maxHeight) {
        textarea.style.height = scrollHeight + "px";
      } else {
        textarea.style.height = maxHeight + "px";
        textarea.style.overflowY = "auto";
      }
    }
  }, [message]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className={`message-container-jota ${isTyping ? 'typing' : ''}`}>
        <div className="moving-border-container-jota">
          <MovingBorder duration={3000} rx="38px" ry="38px">
            <div className="moving-gradient-jota" />
          </MovingBorder>
        </div>
        
        <div className="message-container-inner-jota">
          <div className="inner-container-jota">
            <button 
              type="button"
              className="clip-button-jota"
              title="Anexar arquivos"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={isLoading ? "Processando..." : placeholder}
              disabled={isLoading || isDisabled}
              className="textarea-custom-jota"
              rows={1}
            />
            
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || isDisabled || !message.trim()}
              className="action-button-jota"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .message-container-jota {
          position: relative;
          background: transparent;
          border-radius: 40px;
          padding: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 600px;
          overflow: visible;
          height: 68px;
          z-index: 1000;
        }

        .message-container-inner-jota {
          position: relative;
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          border-radius: 38px;
          height: 100%;
          width: 100%;
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.3),
            0 8px 16px rgba(0, 0, 0, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 3;
        }

        .moving-border-container-jota {
          position: absolute;
          inset: 0;
          border-radius: 40px;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          z-index: 2;
          pointer-events: none;
        }

        .typing .moving-border-container-jota {
          opacity: 1;
        }

        .moving-gradient-jota {
          width: 120px;
          height: 120px;
          background: radial-gradient(
            circle,
            rgba(255, 107, 53, 1) 30%,
            rgba(247, 147, 30, 0.8) 50%,
            transparent 70%
          );
          border-radius: 50%;
          filter: blur(12px);
          box-shadow:
            0 0 40px rgba(255, 107, 53, 0.6),
            0 0 80px rgba(255, 107, 53, 0.4),
            0 0 120px rgba(255, 107, 53, 0.2);
        }

        .inner-container-jota {
          background: #09122b;
          border-radius: 36px;
          padding: 7px 8px 7px 12px;
          border: 1px solid #192038;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          gap: 8px;
        }

        .textarea-custom-jota {
          background: transparent;
          border: none;
          color: #e0e0e0;
          font-size: 16px;
          line-height: 20px;
          resize: none;
          outline: none;
          width: 100%;
          min-height: 20px;
          max-height: 200px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          caret-color: #ff6b35;
          overflow-y: hidden;
          flex: 1;
        }

        .textarea-custom-jota::placeholder {
          color: #999;
          font-style: italic;
        }

        .textarea-custom-jota:disabled {
          opacity: 0.5;
        }

        .action-button-jota {
          background: linear-gradient(145deg, #ff6b35, #f7931e);
          border: none;
          border-radius: 50%;
          color: white;
          width: 47px;
          height: 47px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
          box-shadow:
            0 8px 16px rgba(255, 107, 53, 0.3),
            0 4px 8px rgba(255, 107, 53, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.2),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .action-button-jota:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow:
            0 12px 24px rgba(255, 107, 53, 0.4),
            0 6px 12px rgba(255, 107, 53, 0.3);
        }

        .action-button-jota:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clip-button-jota {
          background: transparent;
          border: none;
          color: #ff6b35;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .clip-button-jota:hover {
          background: rgba(255, 107, 53, 0.1);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

export default ChatInputJota;
