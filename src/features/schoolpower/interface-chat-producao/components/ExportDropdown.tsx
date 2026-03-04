import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import {
  MarkdownIcon,
  PDFIcon,
  DocxIcon,
  GoogleDriveIconFull,
  OneDrivePersonalIcon,
  OneDriveWorkIcon,
} from './export-icons';
import {
  exportAsMarkdown,
  exportAsPDF,
  exportAsDocx,
  buildMarkdownContent,
  getExportFilename,
} from '../services/artifact-export-service';
import {
  isGoogleDriveConfigured,
  saveMarkdownToGoogleDrive,
} from '../services/google-drive-service';
import {
  isOneDriveConfigured,
  saveMarkdownToOneDrive,
} from '../services/onedrive-service';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import type { EditorJSBlock } from './artifact-editorjs-converter';

type ExportOptionId =
  | 'markdown'
  | 'pdf'
  | 'docx'
  | 'google-drive'
  | 'onedrive-personal'
  | 'onedrive-work';

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
  group: 'download' | 'cloud';
  unavailableReason?: string;
}

const ITEM_TRANSITION = 'all 0.15s ease';
const BG_HOVER = 'rgba(255,255,255,0.07)';
const BG_DEFAULT = 'transparent';
const TEXT_MAIN = '#e2e8f0';
const TEXT_SUB = '#94a3b8';
const BORDER_COLOR = '#1e2d4d';
const DROPDOWN_BG = '#0a1628';
const SUCCESS_COLOR = '#4ade80';
const ERROR_COLOR = '#f87171';
const LOADING_COLOR = '#60a5fa';

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
  const [itemStates, setItemStates] = useState<Record<ExportOptionId, ItemState>>({
    markdown: 'idle',
    pdf: 'idle',
    docx: 'idle',
    'google-drive': 'idle',
    'onedrive-personal': 'idle',
    'onedrive-work': 'idle',
  });
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: ExportOptionId; msg: string } | null>(null);
  const [hovered, setHovered] = useState<ExportOptionId | null>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const googleConfigured = isGoogleDriveConfigured();
  const onedriveConfigured = isOneDriveConfigured();

  const options: ExportOption[] = [
    {
      id: 'markdown',
      label: 'Markdown',
      icon: <MarkdownIcon size={20} />,
      group: 'download',
    },
    {
      id: 'pdf',
      label: 'PDF',
      icon: <PDFIcon size={20} />,
      group: 'download',
    },
    {
      id: 'docx',
      label: 'Docx',
      icon: <DocxIcon size={20} />,
      group: 'download',
    },
    {
      id: 'google-drive',
      label: 'Salvar no Google Drive',
      icon: <GoogleDriveIconFull size={20} />,
      group: 'cloud',
      unavailableReason: googleConfigured
        ? undefined
        : 'Configure VITE_GOOGLE_DRIVE_CLIENT_ID para ativar',
    },
    {
      id: 'onedrive-personal',
      label: 'Salvar no OneDrive (pessoal)',
      icon: <OneDrivePersonalIcon size={20} />,
      group: 'cloud',
      unavailableReason: onedriveConfigured
        ? undefined
        : 'Configure VITE_MICROSOFT_CLIENT_ID para ativar',
    },
    {
      id: 'onedrive-work',
      label: 'Salvar no OneDrive (trabalho/escola)',
      icon: <OneDriveWorkIcon size={20} />,
      group: 'cloud',
      unavailableReason: onedriveConfigured
        ? undefined
        : 'Configure VITE_MICROSOFT_CLIENT_ID para ativar',
    },
  ];

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownWidth = 280;
      const viewportWidth = window.innerWidth;
      const rightEdge = viewportWidth - rect.right;
      const adjustedRight = Math.max(rightEdge - 4, 8);
      const finalRight =
        rect.right - dropdownWidth < 8 ? viewportWidth - rect.left - dropdownWidth : adjustedRight;

      setPosition({
        top: rect.bottom + 8,
        right: Math.max(finalRight, 8),
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
        switch (optionId) {
          case 'markdown':
            await exportAsMarkdown(artifact, blocks, editableTitle, editableSubtitle);
            setItemState(optionId, 'success', 'Arquivo .md salvo!');
            break;

          case 'pdf':
            await exportAsPDF(artifact, blocks, editableTitle, editableSubtitle);
            setItemState(optionId, 'success', 'Arquivo .pdf salvo!');
            break;

          case 'docx':
            await exportAsDocx(artifact, blocks, editableTitle, editableSubtitle);
            setItemState(optionId, 'success', 'Arquivo .docx salvo!');
            break;

          case 'google-drive': {
            if (!googleConfigured) {
              setItemState(optionId, 'error', 'Configure VITE_GOOGLE_DRIVE_CLIENT_ID');
              break;
            }
            const mdContent = buildMarkdownContent(artifact, blocks, editableTitle, editableSubtitle);
            const mdFilename = getExportFilename(artifact, editableTitle, 'md');
            const driveResult = await saveMarkdownToGoogleDrive(mdContent, mdFilename);
            if (driveResult.success) {
              setItemState(optionId, 'success', 'Salvo no Google Drive!');
            } else {
              setItemState(optionId, 'error', driveResult.error || 'Erro ao salvar no Drive');
            }
            break;
          }

          case 'onedrive-personal': {
            if (!onedriveConfigured) {
              setItemState(optionId, 'error', 'Configure VITE_MICROSOFT_CLIENT_ID');
              break;
            }
            const mdContent = buildMarkdownContent(artifact, blocks, editableTitle, editableSubtitle);
            const mdFilename = getExportFilename(artifact, editableTitle, 'md');
            const odPersonalResult = await saveMarkdownToOneDrive(mdContent, mdFilename, 'personal');
            if (odPersonalResult.success) {
              setItemState(optionId, 'success', 'Salvo no OneDrive pessoal!');
            } else {
              setItemState(optionId, 'error', odPersonalResult.error || 'Erro ao salvar no OneDrive');
            }
            break;
          }

          case 'onedrive-work': {
            if (!onedriveConfigured) {
              setItemState(optionId, 'error', 'Configure VITE_MICROSOFT_CLIENT_ID');
              break;
            }
            const mdContent = buildMarkdownContent(artifact, blocks, editableTitle, editableSubtitle);
            const mdFilename = getExportFilename(artifact, editableTitle, 'md');
            const odWorkResult = await saveMarkdownToOneDrive(mdContent, mdFilename, 'work');
            if (odWorkResult.success) {
              setItemState(optionId, 'success', 'Salvo no OneDrive corporativo!');
            } else {
              setItemState(optionId, 'error', odWorkResult.error || 'Erro ao salvar no OneDrive');
            }
            break;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro inesperado';
        setItemState(optionId, 'error', message);
      }
    },
    [
      artifact,
      blocks,
      editableTitle,
      editableSubtitle,
      itemStates,
      googleConfigured,
      onedriveConfigured,
      setItemState,
    ]
  );

  if (!isOpen) return null;

  const downloadOptions = options.filter((o) => o.group === 'download');
  const cloudOptions = options.filter((o) => o.group === 'cloud');

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        right: position.right,
        zIndex: 99999,
        width: 280,
        background: DROPDOWN_BG,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: 12,
        boxShadow: '0 16px 48px -8px rgba(0,0,0,0.7), 0 4px 16px -4px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        animation: 'exportDropdownIn 0.15s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <style>{`
        @keyframes exportDropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes exportSpinIcon {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ padding: '6px 0' }}>
        <div
          style={{
            padding: '4px 14px 8px',
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

        {downloadOptions.map((option) => (
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

        <div
          style={{
            height: 1,
            background: BORDER_COLOR,
            margin: '6px 14px',
          }}
        />

        <div
          style={{
            padding: '4px 14px 8px',
            fontSize: 10,
            fontWeight: 600,
            color: TEXT_SUB,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Salvar na nuvem
        </div>

        {cloudOptions.map((option) => (
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

function ExportItem({
  option,
  state,
  feedback,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: ExportItemProps) {
  const isLoading = state === 'loading';
  const isSuccess = state === 'success';
  const isError = state === 'error';
  const isUnavailable = Boolean(option.unavailableReason);

  const stateIcon = isLoading ? (
    <Loader2
      size={14}
      style={{ color: LOADING_COLOR, animation: 'exportSpinIcon 1s linear infinite' }}
    />
  ) : isSuccess ? (
    <Check size={14} style={{ color: SUCCESS_COLOR }} />
  ) : isError ? (
    <AlertCircle size={14} style={{ color: ERROR_COLOR }} />
  ) : null;

  const labelColor = isError
    ? ERROR_COLOR
    : isSuccess
    ? SUCCESS_COLOR
    : isUnavailable
    ? TEXT_SUB
    : TEXT_MAIN;

  return (
    <button
      onClick={isUnavailable || isLoading ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={isUnavailable || isLoading}
      title={option.unavailableReason}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '7px 14px',
        background: hovered && !isUnavailable ? BG_HOVER : BG_DEFAULT,
        border: 'none',
        cursor: isUnavailable || isLoading ? 'default' : 'pointer',
        transition: ITEM_TRANSITION,
        opacity: isUnavailable ? 0.45 : 1,
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
          {feedback && (isSuccess || isError) ? feedback : option.label}
        </span>
        {option.unavailableReason && (
          <span
            style={{
              display: 'block',
              fontSize: 10,
              color: '#64748b',
              fontFamily: "'Inter', sans-serif",
              marginTop: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Não configurado
          </span>
        )}
        {feedback && state === 'success' && !option.unavailableReason && (
          <span
            style={{
              display: 'block',
              fontSize: 10,
              color: '#4ade80',
              fontFamily: "'Inter', sans-serif",
              marginTop: 1,
            }}
          >
            Concluído
          </span>
        )}
      </span>

      <span style={{ flexShrink: 0, width: 16, display: 'flex', justifyContent: 'center' }}>
        {stateIcon}
      </span>
    </button>
  );
}
