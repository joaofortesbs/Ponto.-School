import React, { useMemo } from 'react';
import { convertTextContentToBlocks } from '../../components/Modal-Versao-Texto/text-content-converter';
import { formatInlineMarkdown } from './artifact-editorjs-converter';
import type { EditorJSBlock } from './artifact-editorjs-converter';

const FONT_STACK = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const CALLOUT_STYLES: Record<string, { bg: string; border: string; accent: string; iconBg: string }> = {
  tip: { bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.15)', accent: 'rgba(34, 197, 94, 0.4)', iconBg: 'rgba(34, 197, 94, 0.1)' },
  warning: { bg: 'rgba(234, 179, 8, 0.05)', border: 'rgba(234, 179, 8, 0.15)', accent: 'rgba(234, 179, 8, 0.4)', iconBg: 'rgba(234, 179, 8, 0.1)' },
  important: { bg: 'rgba(99, 102, 241, 0.05)', border: 'rgba(99, 102, 241, 0.15)', accent: 'rgba(99, 102, 241, 0.4)', iconBg: 'rgba(99, 102, 241, 0.1)' },
  danger: { bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.15)', accent: 'rgba(239, 68, 68, 0.4)', iconBg: 'rgba(239, 68, 68, 0.1)' },
  success: { bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.15)', accent: 'rgba(34, 197, 94, 0.4)', iconBg: 'rgba(34, 197, 94, 0.1)' },
  info: { bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.15)', accent: 'rgba(59, 130, 246, 0.4)', iconBg: 'rgba(59, 130, 246, 0.1)' },
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
      const styles: Record<number, { size: string; weight: string; tracking: string; mt: string }> = {
        1: { size: '20px', weight: '700', tracking: '-0.02em', mt: '28px' },
        2: { size: '17px', weight: '700', tracking: '-0.01em', mt: '24px' },
        3: { size: '15px', weight: '600', tracking: '0', mt: '20px' },
        4: { size: '14px', weight: '600', tracking: '0', mt: '16px' },
        5: { size: '13px', weight: '600', tracking: '0.01em', mt: '14px' },
        6: { size: '12px', weight: '600', tracking: '0.02em', mt: '12px' },
      };
      const s = styles[level] || styles[3];
      return (
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: s.size,
            fontWeight: s.weight,
            letterSpacing: s.tracking,
            lineHeight: '1.35',
            color: 'rgba(255, 255, 255, 0.95)',
            marginTop: s.mt,
            marginBottom: '8px',
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    case 'paragraph': {
      const text = block.data.text as string;
      if (!text?.trim()) return null;
      return (
        <p
          style={{
            fontFamily: FONT_STACK,
            fontSize: '14.5px',
            fontWeight: '400',
            lineHeight: '1.75',
            color: 'rgba(255, 255, 255, 0.82)',
            marginTop: '6px',
            marginBottom: '6px',
            letterSpacing: '0.01em',
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    case 'list': {
      const items = block.data.items as string[];
      const isOrdered = block.data.style === 'ordered';
      const Tag = isOrdered ? 'ol' : 'ul';
      return (
        <Tag
          style={{
            marginTop: '10px',
            marginBottom: '10px',
            paddingLeft: '20px',
            listStyleType: isOrdered ? 'decimal' : 'disc',
          }}
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              style={{
                fontFamily: FONT_STACK,
                fontSize: '14.5px',
                fontWeight: '400',
                lineHeight: '1.7',
                color: 'rgba(255, 255, 255, 0.82)',
                marginBottom: '4px',
                paddingLeft: '4px',
              }}
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </Tag>
      );
    }

    case 'checklist': {
      const items = block.data.items as { text: string; checked: boolean }[];
      return (
        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: item.checked ? '1.5px solid rgba(34, 197, 94, 0.5)' : '1.5px solid rgba(255, 255, 255, 0.2)',
                  background: item.checked ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {item.checked && <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: '700' }}>✓</span>}
              </div>
              <span
                style={{
                  fontFamily: FONT_STACK,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: item.checked ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.82)',
                  textDecoration: item.checked ? 'line-through' : 'none',
                }}
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
        <div
          style={{
            marginTop: '14px',
            marginBottom: '14px',
            overflowX: 'auto',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            {withHeadings && rows.length > 0 && (
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                  {rows[0].map((cell, ci) => (
                    <th
                      key={ci}
                      style={{
                        fontFamily: FONT_STACK,
                        padding: '10px 14px',
                        textAlign: 'left',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '600',
                        fontSize: '13px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        letterSpacing: '0.01em',
                      }}
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.slice(withHeadings ? 1 : 0).map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 1 ? 'rgba(255, 255, 255, 0.015)' : 'transparent' }}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        fontFamily: FONT_STACK,
                        padding: '9px 14px',
                        color: 'rgba(255, 255, 255, 0.75)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        fontSize: '13.5px',
                        lineHeight: '1.5',
                      }}
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
        <blockquote
          style={{
            marginTop: '14px',
            marginBottom: '14px',
            paddingLeft: '16px',
            borderLeft: '3px solid rgba(99, 102, 241, 0.4)',
            background: 'rgba(99, 102, 241, 0.03)',
            borderRadius: '0 8px 8px 0',
            padding: '10px 16px',
          }}
        >
          <p
            style={{
              fontFamily: FONT_STACK,
              fontSize: '14px',
              fontStyle: 'italic',
              lineHeight: '1.7',
              color: 'rgba(255, 255, 255, 0.72)',
              margin: 0,
            }}
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
          style={{
            marginTop: '14px',
            marginBottom: '14px',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: style.bg,
            border: `1px solid ${style.border}`,
            borderLeft: `3px solid ${style.accent}`,
          }}
        >
          {icon && (
            <span
              style={{
                fontSize: '15px',
                flexShrink: 0,
                marginTop: '1px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                background: style.iconBg,
              }}
            >
              {icon}
            </span>
          )}
          <span
            style={{
              fontFamily: FONT_STACK,
              fontSize: '14px',
              lineHeight: '1.65',
              color: 'rgba(255, 255, 255, 0.85)',
            }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      );
    }

    case 'code': {
      const code = block.data.code as string;
      return (
        <pre
          style={{
            marginTop: '14px',
            marginBottom: '14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 10, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '14px 16px',
            overflowX: 'auto',
          }}
        >
          <code
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'rgba(74, 222, 128, 0.9)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {code}
          </code>
        </pre>
      );
    }

    case 'delimiter':
      return (
        <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
        </div>
      );

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
      <p
        style={{
          fontFamily: FONT_STACK,
          fontSize: '14.5px',
          fontWeight: '400',
          lineHeight: '1.75',
          color: 'rgba(255, 255, 255, 0.85)',
          whiteSpace: 'pre-wrap',
          letterSpacing: '0.01em',
          margin: 0,
        }}
      >
        {content}
      </p>
    );
  }

  return (
    <div
      className="rich-text-chat-message"
      style={{
        maxWidth: '680px',
        fontFamily: FONT_STACK,
      }}
    >
      <style>{`
        .rich-text-chat-message strong,
        .rich-text-chat-message b {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
        }
        .rich-text-chat-message em,
        .rich-text-chat-message i {
          color: rgba(255, 255, 255, 0.78);
          font-style: italic;
        }
        .rich-text-chat-message code:not(pre code) {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 13px;
          font-family: 'JetBrains Mono', 'Fira Code', Menlo, monospace;
          color: rgba(251, 146, 60, 0.9);
        }
        .rich-text-chat-message a {
          color: rgba(99, 102, 241, 0.9);
          text-decoration: underline;
          text-decoration-color: rgba(99, 102, 241, 0.3);
          text-underline-offset: 2px;
        }
        .rich-text-chat-message a:hover {
          color: rgba(129, 140, 248, 1);
          text-decoration-color: rgba(99, 102, 241, 0.6);
        }
        .rich-text-chat-message > div:first-child,
        .rich-text-chat-message > p:first-child {
          margin-top: 0 !important;
        }
      `}</style>
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

export default RichTextMessage;
