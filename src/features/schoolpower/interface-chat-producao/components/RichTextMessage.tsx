import React, { useMemo } from 'react';
import { convertTextContentToBlocks } from '../../components/Modal-Versao-Texto/text-content-converter';
import { formatInlineMarkdown } from './artifact-editorjs-converter';
import type { EditorJSBlock } from './artifact-editorjs-converter';

const CALLOUT_STYLES: Record<string, { bg: string; border: string; iconBg: string }> = {
  tip: { bg: 'rgba(34, 197, 94, 0.06)', border: 'rgba(34, 197, 94, 0.2)', iconBg: 'rgba(34, 197, 94, 0.15)' },
  warning: { bg: 'rgba(234, 179, 8, 0.06)', border: 'rgba(234, 179, 8, 0.2)', iconBg: 'rgba(234, 179, 8, 0.15)' },
  important: { bg: 'rgba(99, 102, 241, 0.06)', border: 'rgba(99, 102, 241, 0.2)', iconBg: 'rgba(99, 102, 241, 0.15)' },
  danger: { bg: 'rgba(239, 68, 68, 0.06)', border: 'rgba(239, 68, 68, 0.2)', iconBg: 'rgba(239, 68, 68, 0.15)' },
  success: { bg: 'rgba(34, 197, 94, 0.06)', border: 'rgba(34, 197, 94, 0.2)', iconBg: 'rgba(34, 197, 94, 0.15)' },
  info: { bg: 'rgba(59, 130, 246, 0.06)', border: 'rgba(59, 130, 246, 0.2)', iconBg: 'rgba(59, 130, 246, 0.15)' },
};

function hasRichFormatting(text: string): boolean {
  if (!text || text.length < 10) return false;
  const strongIndicators = [
    /^#{1,6}\s/m,
    /\|.*\|.*\|/,
    /^>\s/m,
    /^[-*]\s*\[[ xX]\]/m,
    /```/,
    /^---$/m,
  ];
  for (const pattern of strongIndicators) {
    if (pattern.test(text)) return true;
  }
  const softIndicators = [
    /\*\*[^*]+\*\*/,
    /^[-•*]\s/m,
    /^\d+[.)]\s/m,
  ];
  let softCount = 0;
  for (const pattern of softIndicators) {
    if (pattern.test(text)) softCount++;
    if (softCount >= 2) return true;
  }
  return false;
}

function RenderBlock({ block }: { block: EditorJSBlock }) {
  switch (block.type) {
    case 'header': {
      const level = (block.data.level as number) || 2;
      const text = block.data.text as string;
      const sizeMap: Record<number, string> = {
        1: 'text-[17px] font-bold',
        2: 'text-[15px] font-bold',
        3: 'text-[14px] font-semibold',
        4: 'text-[13px] font-semibold',
        5: 'text-[13px] font-medium',
        6: 'text-[12px] font-medium',
      };
      return (
        <div
          className={`${sizeMap[level] || sizeMap[3]} text-white/95 mt-3 mb-1`}
          style={{ fontFamily: "'Inter', sans-serif" }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    case 'paragraph': {
      const text = block.data.text as string;
      if (!text?.trim()) return null;
      return (
        <p
          className="text-white/85 text-[13px] leading-[1.7] my-1"
          style={{ fontFamily: "'Georgia', serif" }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    case 'list': {
      const items = block.data.items as string[];
      const isOrdered = block.data.style === 'ordered';
      const Tag = isOrdered ? 'ol' : 'ul';
      return (
        <Tag className={`my-1.5 pl-4 space-y-0.5 ${isOrdered ? 'list-decimal' : 'list-disc'}`}>
          {items.map((item, idx) => (
            <li
              key={idx}
              className="text-white/85 text-[13px] leading-[1.6]"
              style={{ fontFamily: "'Georgia', serif" }}
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </Tag>
      );
    }

    case 'checklist': {
      const items = block.data.items as { text: string; checked: boolean }[];
      return (
        <div className="my-1.5 space-y-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div
                className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  item.checked
                    ? 'bg-green-500/20 border-green-500/40'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                {item.checked && <span className="text-green-400 text-[10px]">✓</span>}
              </div>
              <span
                className={`text-[13px] leading-[1.6] ${item.checked ? 'text-white/50 line-through' : 'text-white/85'}`}
                dangerouslySetInnerHTML={{ __html: item.text }}
              />
            </div>
          ))}
        </div>
      );
    }

    case 'table': {
      const rows = block.data.content as string[][];
      const withHeadings = block.data.withHeadings as boolean;
      if (!rows?.length) return null;
      return (
        <div className="my-2 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-[12px]">
            {withHeadings && rows.length > 0 && (
              <thead>
                <tr className="bg-white/5">
                  {rows[0].map((cell, ci) => (
                    <th
                      key={ci}
                      className="px-3 py-1.5 text-left text-white/90 font-semibold border-b border-white/10"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.slice(withHeadings ? 1 : 0).map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-1.5 text-white/80 border-b border-white/5"
                      style={{ fontFamily: "'Georgia', serif" }}
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'quote': {
      const text = block.data.text as string;
      return (
        <blockquote className="my-2 pl-3 border-l-2 border-indigo-400/40">
          <p
            className="text-white/75 text-[13px] italic leading-[1.6]"
            style={{ fontFamily: "'Georgia', serif" }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </blockquote>
      );
    }

    case 'callout': {
      const text = block.data.text as string;
      const calloutType = (block.data.type as string) || 'info';
      const icon = block.data.icon as string;
      const style = CALLOUT_STYLES[calloutType] || CALLOUT_STYLES.info;
      return (
        <div
          className="my-2 rounded-lg px-3 py-2 flex items-start gap-2"
          style={{ background: style.bg, border: `1px solid ${style.border}` }}
        >
          {icon && (
            <span className="text-sm flex-shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded" style={{ background: style.iconBg }}>
              {icon}
            </span>
          )}
          <span
            className="text-white/85 text-[13px] leading-[1.6]"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      );
    }

    case 'code': {
      const code = block.data.code as string;
      return (
        <pre className="my-2 rounded-lg bg-[#0a0a1a] border border-white/10 p-3 overflow-x-auto">
          <code className="text-[12px] text-green-300/90 font-mono whitespace-pre-wrap">{code}</code>
        </pre>
      );
    }

    case 'delimiter':
      return <hr className="my-3 border-white/10" />;

    default:
      return null;
  }
}

interface RichTextMessageProps {
  content: string;
}

export function RichTextMessage({ content }: RichTextMessageProps) {
  const { isRich, blocks } = useMemo(() => {
    const rich = hasRichFormatting(content);
    if (!rich) return { isRich: false, blocks: [] };
    const result = convertTextContentToBlocks(content);
    return { isRich: true, blocks: result.blocks };
  }, [content]);

  if (!isRich) {
    return (
      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  return (
    <div className="rich-text-chat-message">
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

export default RichTextMessage;
