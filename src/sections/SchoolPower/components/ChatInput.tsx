"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame, useMotionTemplate } from "framer-motion";
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';
import { useIsMobile } from "../../../hooks/useIsMobile";


// MovingBorder component
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

interface ChatInputProps {
  isDarkTheme?: boolean;
  onSend?: (message: string) => void;
}

// Componente AIMessageBox
const ChatInput: React.FC<ChatInputProps> = ({ isDarkTheme = true, onSend }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedMode, setSelectedMode] = useState("Agente IA");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleSend = () => {
    if (message.trim()) {
      console.log("Enviando mensagem:", message);

      // Chama a função onSend se fornecida
      if (onSend) {
        onSend(message.trim());
      }

      // Limpa o campo apenas após o envio
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
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <style jsx>{`
        @keyframes pulseGlow {
          0%,
          100% {
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
          background: transparent;
          border-radius: 32px;
          padding: 2px;
          transition: all 0.3s ease;
          width: 600px;
          overflow: visible;
          height: 64px;
        }

        @media (max-width: 768px) {
          .message-container {
            width: 99%; /* Aumenta ainda mais a largura para telas menores */
            max-width: calc(100vw - 6px); /* Reduz ainda mais as margens laterais */
            border-radius: 30px;
            height: 60px;
          }
        }

        .message-container-inner {
          position: relative;
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          border-radius: 30px;
          height: 100%;
          width: 100%;
          box-shadow:
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 15px 30px rgba(0, 0, 0, 0.4),
            0 5px 15px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 3;
        }

        @media (max-width: 768px) {
          .message-container-inner {
             border-radius: 28px;
          }
        }

        .moving-border-container {
          position: absolute;
          inset: 0;
          border-radius: 32px;
          opacity: 1;
          transition: opacity 0.3s ease;
          overflow: hidden;
          z-index: 2;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .moving-border-container {
            border-radius: 30px;
          }
        }

        .typing .moving-border-container {
          opacity: 1;
        }

        .moving-gradient {
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

        .inner-container {
          background: linear-gradient(145deg, #1e1e1e, #2a2a2a);
          border-radius: 30px;
          padding: 12px 20px;
          border: 1px solid #333;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }

        @media (max-width: 768px) {
          .inner-container {
            border-radius: 28px;
            padding: 10px 16px;
          }
        }

        .typing .inner-container {
          border-color: #333;
          box-shadow: none;
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
          min-height: 32px;
          max-height: 32px;
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          caret-color: #ff6b35;
          overflow: hidden;
        }

        .textarea-custom::placeholder {
          color: #999;
          font-style: italic;
        }

        .action-button {
          background: linear-gradient(145deg, #ff6b35, #f7931e);
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
          box-shadow:
            0 8px 16px rgba(255, 107, 53, 0.3),
            0 4px 8px rgba(255, 107, 53, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.2),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .action-button:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 24px rgba(255, 107, 53, 0.4),
            0 6px 12px rgba(255, 107, 53, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.1);
        }

        .action-button:active {
          transform: translateY(-1px);
          box-shadow:
            0 4px 8px rgba(255, 107, 53, 0.4),
            0 2px 4px rgba(255, 107, 53, 0.3),
            inset 0 2px 8px rgba(0, 0, 0, 0.3),
            inset 0 -1px 2px rgba(255, 255, 255, 0.2);
        }

        .voice-button {
          background: linear-gradient(145deg, #666, #888);
          box-shadow:
            0 8px 16px rgba(0, 0, 0, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
        }

        .voice-button:hover {
          background: linear-gradient(145deg, #777, #999);
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.3),
            0 6px 12px rgba(0, 0, 0, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.15),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .voice-button:active {
          transform: translateY(-1px);
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 2px 8px rgba(0, 0, 0, 0.4),
            inset 0 -1px 2px rgba(255, 255, 255, 0.1);
        }

        .file-button {
          background: linear-gradient(145deg, #444, #666);
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
          box-shadow:
            0 8px 16px rgba(0, 0, 0, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .file-button {
            width: 40px;
            height: 40px;
          }
        }

        .file-button:hover {
          background: linear-gradient(145deg, #555, #777);
          color: white;
          transform: translateY(-3px);
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.3),
            0 6px 12px rgba(0, 0, 0, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.15),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .file-button:active {
          transform: translateY(-1px);
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 2px 8px rgba(0, 0, 0, 0.4),
            inset 0 -1px 2px rgba(255, 255, 255, 0.1);
        }

        .mode-selector {
          position: relative;
          display: inline-block;
        }

        .mode-button {
          background: linear-gradient(145deg, #444, #666);
          border: 1px solid #555;
          border-radius: 20px;
          color: #ccc;
          padding: 8px 16px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow:
            0 8px 16px rgba(0, 0, 0, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .mode-button {
            padding: 6px 12px;
            font-size: 10px;
            gap: 6px;
          }
        }

        .mode-button:hover {
          background: linear-gradient(145deg, #555, #777);
          border-color: #666;
          color: white;
          transform: translateY(-3px);
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.3),
            0 6px 12px rgba(0, 0, 0, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.15),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .mode-button:active {
          transform: translateY(-1px);
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 2px 8px rgba(0, 0, 0, 0.4),
            inset 0 -1px 2px rgba(255, 255, 255, 0.1);
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

        @media (max-width: 768px) {
          .mode-dropdown {
            min-width: 150px;
            border-radius: 12px;
            padding: 8px;
          }
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

        @media (max-width: 768px) {
          .mode-option {
            padding: 8px 12px;
            font-size: 11px;
            gap: 8px;
            border-radius: 10px;
          }
        }

        .mode-option:last-child {
          margin-bottom: 0;
        }

        .mode-option::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 107, 53, 0.1),
            rgba(247, 147, 30, 0.1)
          );
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

        @media (max-width: 768px) {
          .mode-icon {
            width: 16px;
            height: 16px;
          }
        }

        .mode-option:hover .mode-icon {
          transform: scale(1.1);
        }

        .mode-option.active .mode-icon {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .mode-option:disabled,
        .mode-option[disabled] {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
          background: rgba(100, 100, 100, 0.1) !important;
          color: rgba(204, 204, 204, 0.6) !important;
        }

        .mode-option:disabled:hover,
        .mode-option[disabled]:hover {
          background: rgba(100, 100, 100, 0.1) !important;
          color: rgba(204, 204, 204, 0.6) !important;
          transform: none !important;
          border: none !important;
          box-shadow: none !important;
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

        @media (max-width: 768px) {
          .tech-accent {
             top: -1px;
             right: -1px;
             width: 6px;
             height: 6px;
          }
        }

        .typing .tech-accent {
          opacity: 1;
          animation: pulseGlow 1.5s ease infinite;
        }

        .expanded-card {
          background: linear-gradient(
            145deg,
            rgba(30, 30, 30, 0.95),
            rgba(26, 26, 26, 0.9)
          );
          border: 1px solid rgba(68, 68, 68, 0.8);
          border-radius: 16px;
          padding: 16px 20px;
          position: relative;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .expanded-card {
            border-radius: 12px;
            padding: 12px 16px;
          }
        }

        .expanded-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 107, 53, 0.05) 0%,
            transparent 50%,
            rgba(247, 147, 30, 0.05) 100%
          );
          border-radius: 16px;
          pointer-events: none;
        }

        .thinking-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .thinking-indicator {
            gap: 8px;
          }
        }

        .pulse-dot {
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border-radius: 50%;
          animation: softPulse 2s ease-in-out infinite;
          box-shadow:
            0 0 12px rgba(255, 107, 53, 0.4),
            0 0 24px rgba(255, 107, 53, 0.2);
        }

        @media (max-width: 768px) {
          .pulse-dot {
            width: 10px;
            height: 10px;
          }
        }

        .thinking-text {
          color: #ccc;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .thinking-text {
            font-size: 11px;
          }
        }

        @keyframes softPulse {
          0%,
          100% {
            opacity: 0.8;
            transform: scale(1);
            box-shadow:
              0 0 12px rgba(255, 107, 53, 0.4),
              0 0 24px rgba(255, 107, 53, 0.2);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
            box-shadow:
              0 0 16px rgba(255, 107, 53, 0.6),
              0 0 32px rgba(255, 107, 53, 0.3);
          }
        }
      `}</style>

      <div
        className={`message-container ${isTyping || isFocused ? "typing" : ""}`}
      >
        <div className="moving-border-container">
          <MovingBorder duration={3000} rx="20px" ry="20px">
            <div className="moving-gradient" />
          </MovingBorder>
        </div>
        <div className="message-container-inner">
          <div className="tech-accent"></div>
          <div className="inner-container">
            <div className="flex items-center gap-3 w-full relative">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Digite sua mensagem..."
                  className="textarea-custom"
                  rows={1}
                />
              </div>

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.85,
                  y: 20,
                  filter: "blur(10px)",
                }}
                animate={
                  isTyping
                    ? {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }
                    : {
                        opacity: 0,
                        scale: 0.85,
                        y: 20,
                        filter: "blur(10px)",
                      }
                }
                transition={{
                  duration: 0.6,
                  ease: [0.23, 1, 0.32, 1],
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
                  y: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
                  filter: { duration: 0.3 },
                }}
                className="expanded-section"
                style={{
                  position: "absolute",
                  top: "-75px",
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  pointerEvents: isTyping ? "auto" : "none",
                }}
              >
                <motion.div
                  className="expanded-card"
                  initial={{ backdropFilter: "blur(0px)" }}
                  animate={{ backdropFilter: "blur(20px)" }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="thinking-indicator">
                    <motion.div
                      className="pulse-dot"
                      initial={{ scale: 0 }}
                      animate={isTyping ? { scale: 1 } : { scale: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3,
                        ease: [0.68, -0.55, 0.265, 1.55],
                      }}
                    />
                    <motion.div
                      className="thinking-text"
                      initial={{ opacity: 0, x: -10 }}
                      animate={
                        isTyping ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
                      }
                      transition={{
                        duration: 0.4,
                        delay: 0.4,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <TextShimmerWave
                        className='font-mono text-sm text-white'
                        duration={1.5}
                        zDistance={8}
                        xDistance={1.5}
                        yDistance={-1.5}
                        scaleDistance={1.08}
                        rotateYDistance={8}
                        spread={1.2}
                      >
                        {selectedMode === "Agente IA"
                          ? "Seu Agente IA está pensando em uma resposta para isso..."
                          : "Seu Assistente IA está pensando em uma resposta para isso..."}
                      </TextShimmerWave>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              <button
                onClick={handleSend}
                className="action-button"
                disabled={!message.trim()}
                style={{ opacity: message.trim() ? 1 : 0.5 }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;