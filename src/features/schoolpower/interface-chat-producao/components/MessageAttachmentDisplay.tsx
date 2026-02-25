import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, Paperclip, ChevronDown, ChevronUp, File } from 'lucide-react';
import type { MessageAttachment } from '../types/message-types';

interface MessageAttachmentDisplayProps {
  attachments: MessageAttachment[];
}

function isImageType(type: string): boolean {
  return type.startsWith('image/');
}

function isPdfType(type: string): boolean {
  return type === 'application/pdf';
}

function getFileIcon(type: string) {
  if (isImageType(type)) return <Image className="w-4 h-4 text-blue-300" />;
  if (isPdfType(type)) return <FileText className="w-4 h-4 text-red-400" />;
  if (type.includes('word') || type.includes('document')) return <FileText className="w-4 h-4 text-blue-400" />;
  return <File className="w-4 h-4 text-gray-400" />;
}

function getFileTypeBadge(type: string): string | null {
  if (isPdfType(type)) return 'PDF';
  if (type.includes('word') || type.includes('document')) return 'DOCX';
  if (type.includes('spreadsheet') || type.includes('xlsx')) return 'XLSX';
  if (type.includes('presentation') || type.includes('pptx')) return 'PPTX';
  if (type === 'text/csv') return 'CSV';
  if (type === 'text/plain') return 'TXT';
  if (type === 'text/markdown') return 'MD';
  return null;
}

function SingleAttachment({ attachment }: { attachment: MessageAttachment }) {
  const isImage = isImageType(attachment.type);

  if (isImage && attachment.preview) {
    return (
      <div className="flex items-center gap-2 bg-blue-700/40 rounded-xl rounded-tr-md p-1.5 border border-blue-500/20">
        <img
          src={attachment.preview}
          alt={attachment.name}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs text-white/90 truncate font-medium">{attachment.name}</p>
        </div>
      </div>
    );
  }

  const badge = getFileTypeBadge(attachment.type);

  return (
    <div className="flex items-center gap-2 bg-blue-700/40 rounded-xl rounded-tr-md p-2 border border-blue-500/20">
      <div className="w-8 h-8 rounded-lg bg-blue-800/60 flex items-center justify-center flex-shrink-0">
        {badge ? (
          <span className="text-[9px] font-bold text-blue-300 uppercase">{badge}</span>
        ) : (
          getFileIcon(attachment.type)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/90 truncate font-medium">{attachment.name}</p>
      </div>
    </div>
  );
}

export function MessageAttachmentDisplay({ attachments }: MessageAttachmentDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  if (!attachments || attachments.length === 0) return null;

  if (attachments.length === 1) {
    return (
      <div className="mt-1.5 max-w-[220px]">
        <SingleAttachment attachment={attachments[0]} />
      </div>
    );
  }

  return (
    <div className="mt-1.5 max-w-[220px]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 bg-blue-700/40 rounded-xl rounded-tr-md p-2 border border-blue-500/20 hover:bg-blue-700/55 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-800/60 flex items-center justify-center flex-shrink-0">
          <Paperclip className="w-4 h-4 text-blue-300" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs text-white/90 font-medium">{attachments.length} anexos</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-blue-300/70 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-blue-300/70 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 flex flex-col gap-1 overflow-hidden"
          >
            {attachments.map((att, i) => (
              <div key={i}>
                <SingleAttachment attachment={att} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MessageAttachmentDisplay;
