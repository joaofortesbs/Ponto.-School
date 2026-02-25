/**
 * CHAT INPUT JOTA - Caixa de Input Dedicada para o Chat do Agente Jota
 * 
 * Componente independente da caixa de input do School Power principal.
 * Permite customizações específicas para o contexto do chat.
 * Suporta upload de arquivos (imagens, PDFs, docs) e drag-and-drop.
 */

"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame, useMotionTemplate, AnimatePresence } from "framer-motion";
import { Paperclip, Send, Loader2, X, FileText, Image as ImageIcon, FileSpreadsheet, File as FileIcon } from 'lucide-react';

export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
}

export interface ChatInputSendPayload {
  text: string;
  files?: FileAttachment[];
}

interface ChatInputJotaProps {
  onSend: (message: string, files?: FileAttachment[]) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/csv', 'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
].join(',');

const ACCEPT_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.csv,.md,.docx,.pptx,.xlsx';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
  if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
  if (type.includes('spreadsheet') || type === 'text/csv') return <FileSpreadsheet className="w-4 h-4" />;
  return <FileIcon className="w-4 h-4" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const hasFiles = attachedFiles.length > 0;
  const canSend = (message.trim() || hasFiles) && !isLoading && !isDisabled;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0 || hasFiles);
  };

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const remaining = MAX_FILES - attachedFiles.length;
    if (remaining <= 0) return;

    const validFiles = files.slice(0, remaining).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`⚠️ Arquivo "${file.name}" excede o limite de 25MB`);
        return false;
      }
      return true;
    });

    const newAttachments: FileAttachment[] = validFiles.map(file => {
      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        status: 'pending',
        progress: 0,
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles(prev => prev.map(f => 
            f.id === attachment.id ? { ...f, preview: e.target?.result as string } : f
          ));
        };
        reader.readAsDataURL(file);
      }

      return attachment;
    });

    setAttachedFiles(prev => [...prev, ...newAttachments]);
    setIsTyping(true);
  }, [attachedFiles.length]);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    setAttachedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      if (updated.length === 0 && !message.trim()) setIsTyping(false);
      return updated;
    });
  }, [message]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleSend = () => {
    if (!canSend) return;
    const trimmedMessage = message.trim();
    onSend(trimmedMessage, hasFiles ? attachedFiles : undefined);
    setMessage("");
    setAttachedFiles([]);
    setIsTyping(false);
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
    <div 
      className="w-full flex flex-col items-center justify-center"
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_EXTENSIONS}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="drag-overlay-jota"
          >
            <Paperclip className="w-8 h-8 text-orange-400" />
            <span className="text-orange-300 text-sm font-medium mt-2">Solte os arquivos aqui</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="file-preview-container-jota"
          >
            {attachedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="file-preview-item-jota"
              >
                {file.preview ? (
                  <div className="file-preview-thumb-jota">
                    <img src={file.preview} alt={file.name} />
                  </div>
                ) : (
                  <div className="file-preview-icon-jota">
                    {getFileIcon(file.type)}
                  </div>
                )}
                <div className="file-preview-info-jota">
                  <span className="file-preview-name-jota">{file.name}</span>
                  <span className="file-preview-size-jota">{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  className="file-preview-remove-jota"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-3 h-3" />
                </button>
                {file.status === 'uploading' && (
                  <div className="file-progress-bar-jota">
                    <div className="file-progress-fill-jota" style={{ width: `${file.progress}%` }} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`message-container-jota ${isTyping ? 'typing' : ''} ${isDragOver ? 'drag-over' : ''}`}>
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
              onClick={handleFileSelect}
              disabled={isLoading || isDisabled || attachedFiles.length >= MAX_FILES}
            >
              <Paperclip className="w-5 h-5" />
              {hasFiles && (
                <span className="clip-badge-jota">{attachedFiles.length}</span>
              )}
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
              disabled={!canSend}
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

        .message-container-jota.drag-over {
          border: 2px dashed rgba(255, 107, 53, 0.5);
          border-radius: 40px;
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
          position: relative;
        }

        .clip-button-jota:hover:not(:disabled) {
          background: rgba(255, 107, 53, 0.1);
          transform: scale(1.1);
        }

        .clip-button-jota:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .clip-badge-jota {
          position: absolute;
          top: -2px;
          right: -4px;
          background: #ff6b35;
          color: white;
          font-size: 10px;
          font-weight: 700;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .drag-overlay-jota {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(9, 18, 43, 0.9);
          border: 2px dashed rgba(255, 107, 53, 0.6);
          border-radius: 20px;
          z-index: 1100;
          pointer-events: none;
        }

        .file-preview-container-jota {
          width: 600px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(9, 18, 43, 0.95);
          border: 1px solid rgba(25, 32, 56, 0.8);
          border-radius: 16px;
          overflow: hidden;
        }

        .file-preview-item-jota {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 6px 10px;
          position: relative;
          max-width: 280px;
        }

        .file-preview-thumb-jota {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .file-preview-thumb-jota img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .file-preview-icon-jota {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(255, 107, 53, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff6b35;
          flex-shrink: 0;
        }

        .file-preview-info-jota {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .file-preview-name-jota {
          font-size: 12px;
          color: #e0e0e0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
          font-weight: 500;
        }

        .file-preview-size-jota {
          font-size: 10px;
          color: #888;
        }

        .file-preview-remove-jota {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #999;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .file-preview-remove-jota:hover {
          background: rgba(255, 80, 80, 0.3);
          color: #ff5050;
        }

        .file-progress-bar-jota {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0 0 10px 10px;
          overflow: hidden;
        }

        .file-progress-fill-jota {
          height: 100%;
          background: linear-gradient(90deg, #ff6b35, #f7931e);
          border-radius: 0 0 10px 10px;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default ChatInputJota;
