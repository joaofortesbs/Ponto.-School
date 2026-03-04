import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { MarkdownIcon, PDFIcon, DocxIcon } from './export-icons';
import {
  exportAsMarkdown,
  exportAsPDF,
  exportAsDocx,
} from '../services/artifact-export-service';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import type { EditorJSBlock } from './artifact-editorjs-converter';

type ExportOptionId = 'markdown' | 'pdf' | 'docx';
type ItemState = 'idle' | 'loading' | 'success' | 'error';

interface ExportDropdownProps {
  artifact: ArtifactData;
  blocks: EditorJSBlock[];
  editableTitle: string;
  editableSubtitle: string;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}

interface ExportOption {
  id: ExportOptionId;
  label: string;
  icon: React.ReactNode;
}

const ITEM_TRANSITION = 'all 0.15s ease';
const BG_HOVER = 'rgba(255,255,255,0.06)';
const BG_DEFAULT = 'transparent';
const TEXT_MAIN = '#e2e8f0';
const TEXT_SUB = '#94a3b8';
const SUCCESS_COLOR = '#4ade80';
const ERROR_COLOR = '#f87171';
const LOADING_COLOR = '#60a5fa';

const options: ExportOption[] = [
  { id: 'markdown', label: 'Markdown', icon: <MarkdownIcon size={20} /> },
  { id: 'pdf',      label: 'PDF',      icon: <PDFIcon size={20} /> },
  { id: 'docx',     label: 'Docx',     icon: <DocxIcon size={20} /> },
];

const INITIAL_STATES: Record<ExportOptionId, ItemState> = {
  markdown: 'idle',
  pdf: 'idle',
  docx: 'idle',
};

export default function ExportDropdown({
  artifact,
  blocks,
  editableTitle,
  editableSubtitle,
  isOpen,
  onClose,
  anchorRef,
}: ExportDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [itemStates, setItemStates] = useState<Record<ExportOptionId, ItemState>>(INITIAL_STATES);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: ExportOptionId; msg: string } | null>(null);
  const [hovered, setHovered] = useState<ExportOptionId | null>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownWidth = 220;
      const viewportWidth = window.innerWidth;
      const rightEdge = viewportWidth - rect.right;
      setPosition({
        top: rect.bottom + 8,
        right: Math.max(rightEdge - 4, 8),
      });
    }
  }, [isOpen, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  const setItemState = useCallback(
    (id: ExportOptionId, state: ItemState, msg?: string) => {
      setItemStates((prev) => ({ ...prev, [id]: state }));
      if (msg) setFeedbackMsg({ id, msg });
      if (state === 'success' || state === 'error') {
        setTimeout(() => {
          setItemStates((prev) => ({ ...prev, [id]: 'idle' }));
          setFeedbackMsg(null);
        }, 3000);
      }
    },
    []
  );

  const handleExport = useCallback(
    async (optionId: ExportOptionId) => {
      if (itemStates[optionId] === 'loading') return;
      setItemState(optionId, 'loading');
      try {
        if (optionId === 'markdown') {
          await exportAsMarkdown(artifact, blocks, editableTitle, editableSubtitle);
          setItemState(optionId, 'success', 'Arquivo .md salvo!');
        } else if (optionId === 'pdf') {
          await exportAsPDF(artifact, blocks, editableTitle, editableSubtitle);
          setItemState(optionId, 'success', 'Arquivo .pdf salvo!');
        } else if (optionId === 'docx') {
          await exportAsDocx(artifact, blocks, editableTitle, editableSubtitle);
          setItemState(optionId, 'success', 'Arquivo .docx salvo!');
        }
      } catch (err) {
        setItemState(optionId, 'error', err instanceof Error ? err.message : 'Erro inesperado');
      }
    },
    [artifact, blocks, editableTitle, editableSubtitle, itemStates, setItemState]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        right: position.right,
        zIndex: 99999,
        width: 220,
        background: '#0c1334',
        border: '1px solid #151c40',
        borderRadius: 12,
        boxShadow: '0 16px 48px -8px rgba(0,0,0,0.7), 0 4px 16px -4px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        animation: 'exportDropdownIn 0.15s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <style>{`
        @keyframes exportDropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes exportSpinIcon {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ padding: '6px 0' }}>
        <div
          style={{
            padding: '6px 14px 8px',
            fontSize: 10,
            fontWeight: 600,
            color: TEXT_SUB,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Baixar como
        </div>

        {options.map((option) => (
          <ExportItem
            key={option.id}
            option={option}
            state={itemStates[option.id]}
            feedback={feedbackMsg?.id === option.id ? feedbackMsg.msg : null}
            hovered={hovered === option.id}
            onMouseEnter={() => setHovered(option.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleExport(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ExportItemProps {
  option: ExportOption;
  state: ItemState;
  feedback: string | null;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function ExportItem({ option, state, feedback, hovered, onMouseEnter, onMouseLeave, onClick }: ExportItemProps) {
  const isLoading = state === 'loading';
  const isSuccess = state === 'success';
  const isError   = state === 'error';

  const stateIcon = isLoading ? (
    <Loader2 size={14} style={{ color: LOADING_COLOR, animation: 'exportSpinIcon 1s linear infinite' }} />
  ) : isSuccess ? (
    <Check size={14} style={{ color: SUCCESS_COLOR }} />
  ) : isError ? (
    <AlertCircle size={14} style={{ color: ERROR_COLOR }} />
  ) : null;

  const labelColor = isError ? ERROR_COLOR : isSuccess ? SUCCESS_COLOR : TEXT_MAIN;
  const displayLabel = feedback && (isSuccess || isError) ? feedback : option.label;

  return (
    <button
      onClick={isLoading ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '7px 14px',
        background: hovered ? BG_HOVER : BG_DEFAULT,
        border: 'none',
        cursor: isLoading ? 'default' : 'pointer',
        transition: ITEM_TRANSITION,
        textAlign: 'left',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          opacity: isLoading ? 0.5 : 1,
          transition: ITEM_TRANSITION,
        }}
      >
        {option.icon}
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: labelColor,
            transition: ITEM_TRANSITION,
            fontFamily: "'Inter', -apple-system, sans-serif",
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {displayLabel}
        </span>
      </span>

      <span style={{ flexShrink: 0, width: 16, display: 'flex', justifyContent: 'center' }}>
        {stateIcon}
      </span>
    </button>
  );
}
