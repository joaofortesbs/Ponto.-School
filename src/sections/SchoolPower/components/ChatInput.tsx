"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame, useMotionTemplate } from "framer-motion";
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';
import { useIsMobile } from "@/hooks/useIsMobile";
import { BookOpen, Zap, Brain, GraduationCap } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'other';
}


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
  onSend?: (message: string, files?: UploadedFile[]) => void;
}

// Componente AIMessageBox
const ChatInput: React.FC<ChatInputProps> = ({ isDarkTheme = true, onSend }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedMode, setSelectedMode] = useState("Agente IA");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showElementsDropup, setShowElementsDropup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const isQuizMode = false; // Placeholder for isQuizMode logic

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (trimmedMessage || uploadedFiles.length > 0) {
      console.log("📤 Enviando mensagem:", trimmedMessage);
      console.log("📎 Arquivos anexados:", uploadedFiles.length);

      // Chama a função onSend se fornecida, passando mensagem e arquivos
      if (onSend) {
        onSend(trimmedMessage, uploadedFiles);
      }

      // Limpa o campo e arquivos após o envio
      setMessage("");
      setUploadedFiles([]);
      setSelectedCard(null);
      setIsTyping(false);

      console.log("✅ Mensagem enviada e campos limpos");
    } else {
      console.warn("⚠️ Tentativa de enviar mensagem vazia");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleElementsDropup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowElementsDropup(!showElementsDropup);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    Array.from(files).forEach((file) => {
      const fileType = file.type.startsWith('image/') ? 'image' :
                      file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other';

      const fileData: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: fileType
      };

      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          fileData.preview = reader.result as string;
          setUploadedFiles(prev => [...prev, fileData]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(fileData);
      }
    });

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowElementsDropup(false);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    setShowElementsDropup(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (showElementsDropup) {
        setShowElementsDropup(false);
      }
    };

    if (showElementsDropup) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showElementsDropup]);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const lineHeight = 20; // line-height em pixels
      const minHeight = 20; // altura mínima (1 linha exata)
      const maxLinesBeforeExpand = 1; // número de linhas antes de começar a expandir
      const maxHeight = 200; // altura máxima antes de ativar scroll
      const thresholdHeight = lineHeight * maxLinesBeforeExpand; // 20px para 1 linha

      // Reseta a altura para calcular o scrollHeight real
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";
      const scrollHeight = textarea.scrollHeight;

      // Se o conteúdo é menor ou igual a 1 linha, mantém altura fixa
      if (scrollHeight <= thresholdHeight) {
        textarea.style.height = minHeight + "px";
        textarea.classList.remove("expanding");
      } else if (scrollHeight <= maxHeight) {
        // Se passou de 1 linha mas não atingiu o máximo, expande para mostrar todo o conteúdo
        textarea.style.height = scrollHeight + "px";
        textarea.classList.add("expanding");
      } else {
        // Se atingiu o máximo, fixa na altura máxima e ativa scroll
        textarea.style.height = maxHeight + "px";
        textarea.style.overflowY = "auto";
        textarea.classList.add("expanding");
      }
    }
  }, [message]);

  const handleCardClick = (cardName: string) => {
    const cardTexts: { [key: string]: string } = {
      "Plano ENEM": "Preciso criar atividades interativas focadas na preparação no ENEM para estudantes, sobre o tema:",
      "Aula Turbo": "Preciso criar atividades interativas focadas na criação de uma aula que engaja meus alunos, conclui habilidades e cumpri os critérios da minha grade, sobre o tema:",
      "Criando Gênios": "Preciso criar atividades interativas focadas na exploração de habilidades dos estudantes, para a conclusão e trilhagem de novas áreas, sobre o tema:",
      "Escola Viva": "Preciso criar atividades interativas focadas na em engajar o público da minha escola, e criar o senso a cultura viva entre os alunos, sobre o tema:"
    };

    setSelectedCard(cardName);
    setMessage(cardTexts[cardName] || cardName);
    setIsTyping(true);
    textareaRef.current?.focus();
  };


  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <style>{`
        .unified-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          width: 100%;
          max-width: 800px;
          padding: 0;
          margin: 0;
        }

        @media (max-width: 768px) {
          .unified-container {
            gap: 0;
            width: 99%;
            max-width: calc(100vw - 6px);
            padding: 0;
            margin: 0;
          }
        }
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
          position: fixed;
          bottom: 67px;
          left: 50%;
          transform: translateX(-50%);
          background: transparent;
          border-radius: 40px;
          padding: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 600px;
          overflow: visible;
          height: 68px;
          z-index: 1000;
        }

        .message-container.mobile-quiz {
          width: 99%;
          max-width: calc(100vw - 6px);
          border-radius: 35px;
          height: 56px;
          bottom: 70px;
        }

        .message-container.has-files {
          height: auto;
          max-height: 500px;
          border-radius: 24px;
        }

        .message-container.expanding {
          height: auto;
          max-height: 400px;
        }

        @media (max-width: 768px) {
          .message-container.has-files {
            max-height: 350px;
            border-radius: 20px;
          }
        }

        .message-container-inner {
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
          transition: border-radius 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .message-container.has-files .message-container-inner {
          border-radius: 22px;
        }

        @media (max-width: 768px) {
          .message-container-inner {
             border-radius: 33px;
          }

          .message-container.has-files .message-container-inner {
            border-radius: 18px;
          }
        }

        .moving-border-container {
          position: absolute;
          inset: 0;
          border-radius: 40px;
          opacity: 1;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          z-index: 2;
          pointer-events: none;
        }

        .message-container.has-files .moving-border-container {
          border-radius: 24px;
        }

        @media (max-width: 768px) {
          .moving-border-container {
            border-radius: 35px;
          }

          .message-container.has-files .moving-border-container {
            border-radius: 20px;
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
          border-radius: 36px;
          padding: 7px 8px 7px 12px;
          border: 1px solid #333;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          gap: 8px;
          flex-direction: column;
        }

        .message-container:not(.has-files) .inner-container {
          flex-direction: row;
        }

        .message-container.has-files .inner-container {
          border-radius: 20px;
          padding: 16px;
          align-items: stretch;
        }

        @media (max-width: 768px) {
          .inner-container {
            border-radius: 31px;
            padding: 10px 16px;
          }

          .message-container.has-files .inner-container {
            border-radius: 16px;
            padding: 12px;
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
          line-height: 20px;
          resize: none;
          outline: none;
          width: 100%;
          min-height: 20px;
          max-height: 200px;
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          caret-color: #ff6b35;
          overflow-y: hidden;
          display: block;
          transition: height 0.2s ease;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        .textarea-custom::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          display: none;
        }

        .textarea-custom.expanding {
          overflow-y: auto;
        }

        .textarea-custom::placeholder {
          color: #999;
          font-style: italic;
          line-height: 32px; /* Mantido o line-height do placeholder */
        }

        .action-button {
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
            inset 0 2px 8px rgba(0, 0, 0, 0.4),
            inset 0 -1px 2px rgba(255, 255, 255, 0.2);
        }

        .clip-button {
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

        .clip-button:hover {
          background: rgba(255, 107, 53, 0.1);
          transform: scale(1.1);
        }

        .clip-button:active {
          transform: scale(0.95);
        }

        .elements-dropup {
          position: absolute;
          bottom: 100%;
          left: 0;
          background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
          border: 1px solid #555;
          border-radius: 16px;
          padding: 8px;
          margin-bottom: 12px;
          min-width: 220px;
          box-shadow:
            0 8px 16px rgba(0, 0, 0, 0.3),
            0 4px 8px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 107, 53, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 100000;
          backdrop-filter: blur(10px);
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .elements-dropup.show {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .elements-option {
          display: flex;
          align-items: center;
          gap: 12px;
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
          position: relative;
          overflow: hidden;
        }

        .elements-option.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        .elements-option::before {
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

        .elements-option:not(.disabled):hover::before {
          opacity: 1;
        }

        .elements-option:not(.disabled):hover {
          color: #ff6b35;
          transform: translateX(4px);
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
        }

        .elements-option-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .elements-option:not(.disabled):hover .elements-option-icon {
          transform: scale(1.1);
        }

        .uploaded-files-container {
          display: flex;
          gap: 8px;
          padding: 0 0 12px 0;
          flex-wrap: wrap;
          max-height: 200px;
          overflow-y: auto;
          width: 100%;
          order: -1;
          position: relative;
          z-index: 10000;
        }

        .message-container:not(.has-files) .uploaded-files-container {
          display: none;
        }

        .file-preview {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
          border: 1px solid #444;
          border-radius: 12px;
          transition: all 0.3s ease;
          z-index: 10001;
        }

        .file-preview.is-image {
          padding: 0;
          background: transparent;
          border: none;
          overflow: hidden;
          width: 56px;
          height: 56px;
        }

        .file-preview:hover {
          background: linear-gradient(145deg, #333, #222);
          border-color: #ff6b35;
          transform: translateY(-2px);
        }

        .file-preview.is-image:hover {
          background: transparent;
        }

        .file-preview.is-image:hover .file-preview-image {
          border-color: #ff6b35;
        }

        .file-preview-image {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #444;
          transition: border-color 0.3s ease;
        }

        .file-preview-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #444, #666);
          border-radius: 8px;
          color: #ff6b35;
        }

        .file-preview-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-width: 150px;
        }

        .file-preview-name {
          font-size: 12px;
          color: #e0e0e0;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-preview-size {
          font-size: 10px;
          color: #999;
        }

        .file-preview-remove {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(145deg, #ff6b35, #f7931e);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);
          z-index: 10002;
        }

        .file-preview.is-image .file-preview-remove {
          top: -6px;
          right: -6px;
        }

        .file-preview-remove:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.6);
        }

        .file-preview-remove svg {
          width: 12px;
          height: 12px;
          color: white;
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

        /* Cards retangulares abaixo da caixa de mensagens */
        .quick-access-cards {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          width: 100%;
          padding: 0 2px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .quick-access-cards {
            gap: 8px;
            margin: 0;
          }
        }

        .quick-access-card {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0;
          padding: 10px 11px;
          background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
          border: 1px solid #333;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .quick-access-card {
            padding: 10px 12px;
            border-radius: 999px;
          }
        }

        .quick-access-card:hover {
          background: linear-gradient(145deg, #333, #2a2a2a);
          border-color: rgba(255, 107, 0, 0.4);
          box-shadow:
            0 6px 12px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(255, 107, 0, 0.15);
          transform: translateY(-2px);
        }

        .quick-access-card-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          color: #ff6b35;
          transition: all 0.3s ease;
          margin-right: 12px;
        }

        @media (max-width: 768px) {
          .quick-access-card-icon {
            width: 20px;
            height: 20px;
            margin-right: 17px;
          }
        }

        .quick-access-card:hover .quick-access-card-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 0 8px rgba(255, 107, 0, 0.6));
        }

        .quick-access-card-text {
          font-size: 13px;
          font-weight: 500;
          color: #e0e0e0;
          white-space: nowrap;
          transition: color 0.3s ease;
          margin: 0;
          padding: 0;
        }

        @media (max-width: 768px) {
          .quick-access-card-text {
            font-size: 11px;
          }
        }

        .quick-access-card:hover .quick-access-card-text {
          color: #ff6b35;
        }

        .quick-access-card.selected {
          background: linear-gradient(145deg, #ff6b35, #f7931e);
          border-color: #ff6b35;
          box-shadow:
            0 8px 16px rgba(255, 107, 53, 0.4),
            0 4px 8px rgba(255, 107, 53, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .quick-access-card.selected .quick-access-card-icon {
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .quick-access-card.selected .quick-access-card-text {
          color: white;
          font-weight: 600;
        }
      `}</style>

      <div className="unified-container">
        {/* Container invisível unificado - sem espaços */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0', margin: '0' }}>
          <div
            className={`message-container ${isTyping || isFocused ? "typing" : ""} ${uploadedFiles.length > 0 ? "has-files" : ""} ${textareaRef.current?.classList.contains('expanding') ? 'expanding' : ''} ${isMobile && isQuizMode ? 'mobile-quiz' : ''}`}
          >
          <div className="moving-border-container">
            <MovingBorder duration={3000} rx="20px" ry="20px">
              <div className="moving-gradient" />
            </MovingBorder>
          </div>
          <div className="message-container-inner">
            <div className="tech-accent"></div>
            <div className="inner-container">
            {/* Input oculto para upload de arquivos */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
              style={{ display: 'none' }}
            />

            {/* Preview de arquivos enviados - sempre renderizado mas oculto quando vazio */}
            <div className="uploaded-files-container">
              {uploadedFiles.map((fileData) => (
                <div key={fileData.id} className={`file-preview ${fileData.type === 'image' ? 'is-image' : ''}`}>
                  {fileData.type === 'image' && fileData.preview ? (
                    <>
                      <img src={fileData.preview} alt={fileData.file.name} className="file-preview-image" />
                      <button className="file-preview-remove" onClick={() => removeFile(fileData.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="file-preview-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                          <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                      </div>
                      <div className="file-preview-info">
                        <span className="file-preview-name">{fileData.file.name}</span>
                        <span className="file-preview-size">
                          {(fileData.file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button className="file-preview-remove" onClick={() => removeFile(fileData.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center relative" style={{ gap: '8px', width: '100%', flex: '1' }}>
              <button className="clip-button" onClick={toggleElementsDropup} style={{ flexShrink: 0 }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              <div className={`elements-dropup ${showElementsDropup ? 'show' : ''}`}>
                <button className="elements-option" onClick={triggerFileInput}>
                  <svg className="elements-option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  Adicionar arquivos
                </button>

                <button className="elements-option">
                  <svg className="elements-option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Adicionar um contexto
                </button>

                <button className="elements-option disabled">
                  <svg className="elements-option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  Recentes
                </button>
              </div>

              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Digite o que você quer criar..."
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
                  isTyping && uploadedFiles.length === 0
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
                  pointerEvents: isTyping && uploadedFiles.length === 0 ? "auto" : "none",
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
                style={{
                  opacity: message.trim() ? 1 : 0.5,
                  flexShrink: 0,
                  marginLeft: 'auto'
                }}
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

      {/* Cards retangulares abaixo da caixa de mensagens */}
          <div className="quick-access-cards">
            <div className={`quick-access-card ${selectedCard === "Plano ENEM" ? "selected" : ""}`} onClick={() => handleCardClick("Plano ENEM")}>
              <BookOpen className="quick-access-card-icon" />
              <span className="quick-access-card-text">Plano ENEM</span>
            </div>
            <div className={`quick-access-card ${selectedCard === "Aula Turbo" ? "selected" : ""}`} onClick={() => handleCardClick("Aula Turbo")}>
              <Zap className="quick-access-card-icon" />
              <span className="quick-access-card-text">Aula Turbo</span>
            </div>
            <div className={`quick-access-card ${selectedCard === "Criando Gênios" ? "selected" : ""}`} onClick={() => handleCardClick("Criando Gênios")}>
              <Brain className="quick-access-card-icon" />
              <span className="quick-access-card-text">Criando Gênios</span>
            </div>
            <div className={`quick-access-card ${selectedCard === "Escola Viva" ? "selected" : ""}`} onClick={() => handleCardClick("Escola Viva")}>
              <GraduationCap className="quick-access-card-icon" />
              <span className="quick-access-card-text">Escola Viva</span>
            </div>
          </div>
        </div>
        {/* Fim do container invisível unificado */}
      </div>
    </div>
  );
};

export default ChatInput;