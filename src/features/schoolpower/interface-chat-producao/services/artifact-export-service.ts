import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import type { EditorJSBlock } from '../components/artifact-editorjs-converter';

type DocxElement = Paragraph | Table;

function stripHtml(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-zA-Z0-9\-_\s\u00C0-\u024F]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 80)
    .trim();
}

function parseInlineHtml(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const clean = text || '';

  const regex = /<(b|strong|i|em)>([\s\S]*?)<\/\1>|<(b|strong)><(i|em)>([\s\S]*?)<\/\4><\/\3>|<(i|em)><(b|strong)>([\s\S]*?)<\/\7><\/\6>|([^<]+)/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(clean)) !== null) {
    if (match[9] !== undefined) {
      const plain = match[9];
      if (plain) runs.push(new TextRun({ text: plain, size: 24 }));
    } else if (match[5] !== undefined) {
      runs.push(new TextRun({ text: stripHtml(match[5]), size: 24, bold: true, italics: true }));
    } else if (match[8] !== undefined) {
      runs.push(new TextRun({ text: stripHtml(match[8]), size: 24, bold: true, italics: true }));
    } else if (match[1] && (match[1] === 'b' || match[1] === 'strong')) {
      runs.push(new TextRun({ text: stripHtml(match[2]), size: 24, bold: true }));
    } else if (match[1] && (match[1] === 'i' || match[1] === 'em')) {
      runs.push(new TextRun({ text: stripHtml(match[2]), size: 24, italics: true }));
    }
  }

  if (runs.length === 0 && clean) {
    runs.push(new TextRun({ text: stripHtml(clean), size: 24 }));
  }

  return runs;
}

// ─── MARKDOWN EXPORT ──────────────────────────────────────────────────────────

function buildMarkdownContent(
  artifact: ArtifactData,
  blocks: EditorJSBlock[],
  editableTitle: string,
  editableSubtitle: string
): string {
  const cleanTitle = editableTitle
    ? editableTitle.replace(/<[^>]*>/g, '')
    : artifact.metadata.titulo;
  const cleanSubtitle = editableSubtitle
    ? editableSubtitle.replace(/<[^>]*>/g, '')
    : (artifact.metadata.subtitulo || '');

  const date = new Date(artifact.metadata.geradoEm).toLocaleDateString('pt-BR');
  let md = `# ${cleanTitle}\n`;
  if (cleanSubtitle) md += `\n> ${cleanSubtitle}\n`;
  md += `\n_Gerado em: ${date}_\n\n---\n\n`;

  for (const block of blocks) {
    switch (block.type) {
      case 'header': {
        const level = (block.data as any).level || 2;
        const hashes = '#'.repeat(Math.min(level, 6));
        md += `${hashes} ${stripHtml((block.data as any).text || '')}\n\n`;
        break;
      }
      case 'paragraph': {
        const text = stripHtml((block.data as any).text || '');
        if (text.trim()) md += `${text}\n\n`;
        break;
      }
      case 'list': {
        const items: string[] = (block.data as any).items || [];
        const ordered = (block.data as any).style === 'ordered';
        items.forEach((item, idx) => {
          md += `${ordered ? `${idx + 1}.` : '-'} ${stripHtml(item)}\n`;
        });
        md += '\n';
        break;
      }
      case 'checklist': {
        const checkItems: { text: string; checked: boolean }[] = (block.data as any).items || [];
        checkItems.forEach((ci) => {
          md += `- [${ci.checked ? 'x' : ' '}] ${stripHtml(ci.text)}\n`;
        });
        md += '\n';
        break;
      }
      case 'quote': {
        const qText = stripHtml((block.data as any).text || '');
        if (qText.trim()) md += `> ${qText}\n\n`;
        break;
      }
      case 'delimiter': {
        md += '---\n\n';
        break;
      }
      case 'table': {
        const rows: string[][] = (block.data as any).content || [];
        const withHeadings: boolean = (block.data as any).withHeadings || false;
        rows.forEach((row, ri) => {
          md += `| ${row.map((c) => stripHtml(c).replace(/\|/g, '\\|')).join(' | ')} |\n`;
          if (ri === 0 && withHeadings) {
            md += `| ${row.map(() => '---').join(' | ')} |\n`;
          }
        });
        if (rows.length) md += '\n';
        break;
      }
      case 'code': {
        const lang = (block.data as any).language || '';
        const code = (block.data as any).code || '';
        md += `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
        break;
      }
      case 'callout': {
        const icon = (block.data as any).icon || '💡';
        const callText = stripHtml((block.data as any).text || '');
        md += `> ${icon} ${callText}\n\n`;
        break;
      }
      default: {
        const fallback = stripHtml((block.data as any).text || '');
        if (fallback.trim()) md += `${fallback}\n\n`;
        break;
      }
    }
  }

  return md;
}

export async function exportAsMarkdown(
  artifact: ArtifactData,
  blocks: EditorJSBlock[],
  editableTitle: string,
  editableSubtitle: string
): Promise<void> {
  const content = buildMarkdownContent(artifact, blocks, editableTitle, editableSubtitle);
  const cleanTitle = editableTitle
    ? editableTitle.replace(/<[^>]*>/g, '')
    : artifact.metadata.titulo;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${sanitizeFileName(cleanTitle) || 'documento'}.md`);
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────

function buildBodyHtml(
  blocks: EditorJSBlock[],
  title: string,
  subtitle: string,
  date: string
): string {
  const H = (tag: string, content: string, style: string) =>
    `<${tag} style="${style}">${content}</${tag}>`;

  let body = '';

  body += H(
    'h1',
    title,
    'font-family:Georgia,serif;font-size:26px;font-weight:700;color:#111;margin:0 0 8px 0;line-height:1.3;'
  );
  if (subtitle) {
    body += H(
      'p',
      subtitle,
      'font-family:Georgia,serif;font-size:15px;color:#666;font-style:italic;margin:0 0 6px 0;'
    );
  }
  body += H(
    'p',
    `Gerado em: ${date}`,
    'font-family:Georgia,serif;font-size:12px;color:#999;margin:0 0 16px 0;'
  );
  body += `<div style="width:60px;height:3px;background:#4f7ef7;border-radius:2px;margin:0 0 24px 0;"></div>`;

  for (const block of blocks) {
    switch (block.type) {
      case 'header': {
        const level = (block.data as any).level || 2;
        const sizes: Record<number, string> = {
          1: '22px', 2: '19px', 3: '17px', 4: '15px', 5: '14px', 6: '13px',
        };
        const margins: Record<number, string> = {
          1: '24px 0 10px', 2: '20px 0 8px', 3: '18px 0 6px', 4: '14px 0 4px', 5: '12px 0 4px', 6: '10px 0 4px',
        };
        const style = `font-family:Georgia,serif;font-size:${sizes[level] || '17px'};font-weight:700;color:#1a1a1a;margin:${margins[level] || '14px 0 6px'};line-height:1.4;`;
        body += H(`h${level}`, (block.data as any).text || '', style);
        break;
      }
      case 'paragraph': {
        const text = (block.data as any).text || '';
        if (text.trim()) {
          body += H('p', text, 'font-family:Georgia,serif;font-size:14px;line-height:1.75;color:#222;margin:8px 0;');
        }
        break;
      }
      case 'list': {
        const items: string[] = (block.data as any).items || [];
        const ordered = (block.data as any).style === 'ordered';
        const tag = ordered ? 'ol' : 'ul';
        const liStyle = 'font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#222;margin:3px 0;';
        const listStyle = `font-family:Georgia,serif;font-size:14px;color:#222;margin:8px 0 8px 24px;padding-left:8px;`;
        body += `<${tag} style="${listStyle}">`;
        items.forEach((i) => { body += H('li', i, liStyle); });
        body += `</${tag}>`;
        break;
      }
      case 'checklist': {
        const checkItems: { text: string; checked: boolean }[] = (block.data as any).items || [];
        body += `<ul style="list-style:none;padding-left:0;margin:8px 0;">`;
        checkItems.forEach((ci) => {
          const check = ci.checked ? '&#9989;' : '&#9744;';
          body += `<li style="font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#222;margin:3px 0;">${check}&nbsp;${ci.text}</li>`;
        });
        body += `</ul>`;
        break;
      }
      case 'quote': {
        const qText = (block.data as any).text || '';
        body += `<blockquote style="border-left:4px solid #4f7ef7;padding:10px 16px;margin:12px 0;background:#f4f7ff;border-radius:0 6px 6px 0;font-family:Georgia,serif;font-size:14px;font-style:italic;color:#444;line-height:1.7;">${qText}</blockquote>`;
        break;
      }
      case 'delimiter': {
        body += `<hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">`;
        break;
      }
      case 'table': {
        const rows: string[][] = (block.data as any).content || [];
        const withHeadings: boolean = (block.data as any).withHeadings || false;
        if (rows.length > 0) {
          body += `<table style="width:100%;border-collapse:collapse;margin:12px 0;font-family:Georgia,serif;font-size:13px;">`;
          rows.forEach((row, ri) => {
            const isHeader = ri === 0 && withHeadings;
            body += '<tr>';
            row.forEach((cell) => {
              const cellTag = isHeader ? 'th' : 'td';
              const cellStyle = isHeader
                ? 'border:1px solid #b0c4de;padding:8px 10px;text-align:left;background:#dde9ff;font-weight:700;color:#1a1a1a;'
                : `border:1px solid #ddd;padding:8px 10px;text-align:left;color:#333;background:${ri % 2 === 0 ? '#fff' : '#f8faff'};`;
              body += `<${cellTag} style="${cellStyle}">${cell}</${cellTag}>`;
            });
            body += '</tr>';
          });
          body += `</table>`;
        }
        break;
      }
      case 'code': {
        const lang = (block.data as any).language || '';
        const code = (block.data as any).code || '';
        body += `<div style="margin:12px 0;">`;
        if (lang) {
          body += `<div style="font-family:monospace;font-size:11px;color:#888;background:#eee;padding:2px 10px;border-radius:4px 4px 0 0;display:inline-block;">${lang}</div>`;
        }
        body += `<pre style="background:#f5f5f5;border:1px solid #e0e0e0;border-radius:${lang ? '0 6px 6px 6px' : '6px'};padding:12px;overflow-x:auto;font-family:Courier New,monospace;font-size:12px;line-height:1.6;margin:0;color:#1a1a1a;white-space:pre-wrap;">${code}</pre></div>`;
        break;
      }
      case 'callout': {
        const icon = (block.data as any).icon || '💡';
        const callText = (block.data as any).text || '';
        body += `<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:10px 16px;margin:12px 0;border-radius:0 6px 6px 0;font-family:Georgia,serif;font-size:14px;color:#444;line-height:1.7;">${icon}&nbsp;${callText}</div>`;
        break;
      }
      default: {
        const fallback = (block.data as any).text || '';
        if (fallback.trim()) {
          body += H('p', fallback, 'font-family:Georgia,serif;font-size:14px;line-height:1.75;color:#222;margin:8px 0;');
        }
        break;
      }
    }
  }

  return body;
}

export async function exportAsPDF(
  artifact: ArtifactData,
  blocks: EditorJSBlock[],
  editableTitle: string,
  editableSubtitle: string
): Promise<void> {
  const cleanTitle = editableTitle
    ? editableTitle.replace(/<[^>]*>/g, '')
    : artifact.metadata.titulo;
  const cleanSubtitle = editableSubtitle
    ? editableSubtitle.replace(/<[^>]*>/g, '')
    : (artifact.metadata.subtitulo || '');
  const date = new Date(artifact.metadata.geradoEm).toLocaleDateString('pt-BR');

  const bodyHtml = buildBodyHtml(blocks, cleanTitle, cleanSubtitle, date);

  const container = document.createElement('div');
  container.style.cssText = [
    'background:#ffffff',
    'padding:48px 56px',
    'box-sizing:border-box',
    'font-family:Georgia,serif',
    'color:#1a1a1a',
    'line-height:1.7',
  ].join(';');
  container.innerHTML = bodyHtml;

  const html2pdf = (await import('html2pdf.js')).default;
  const filename = `${sanitizeFileName(cleanTitle) || 'documento'}.pdf`;

  await html2pdf()
    .from(container)
    .set({
      margin: [15, 15, 20, 15],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    })
    .save();
}

// ─── DOCX EXPORT ──────────────────────────────────────────────────────────────

function buildDocxElements(blocks: EditorJSBlock[]): DocxElement[] {
  const elements: DocxElement[] = [];

  const cellBorder = {
    top:    { style: BorderStyle.SINGLE, size: 6, color: 'A0B4D0' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: 'A0B4D0' },
    left:   { style: BorderStyle.SINGLE, size: 6, color: 'A0B4D0' },
    right:  { style: BorderStyle.SINGLE, size: 6, color: 'A0B4D0' },
  };

  for (const block of blocks) {
    switch (block.type) {

      case 'header': {
        const level = (block.data as any).level || 2;
        const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
          1: HeadingLevel.HEADING_1,
          2: HeadingLevel.HEADING_2,
          3: HeadingLevel.HEADING_3,
          4: HeadingLevel.HEADING_4,
          5: HeadingLevel.HEADING_5,
          6: HeadingLevel.HEADING_6,
        };
        elements.push(
          new Paragraph({
            text: stripHtml((block.data as any).text || ''),
            heading: headingMap[level] || HeadingLevel.HEADING_2,
            spacing: { before: 280, after: 120 },
          })
        );
        break;
      }

      case 'paragraph': {
        const rawText = (block.data as any).text || '';
        if (rawText.trim()) {
          const runs = parseInlineHtml(rawText);
          elements.push(
            new Paragraph({
              children: runs,
              spacing: { after: 160 },
            })
          );
        }
        break;
      }

      case 'list': {
        const items: string[] = (block.data as any).items || [];
        const ordered = (block.data as any).style === 'ordered';
        items.forEach((item, idx) => {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${ordered ? `${idx + 1}.` : '•'}  ${stripHtml(item)}`,
                  size: 24,
                }),
              ],
              indent: { left: 720 },
              spacing: { after: 80 },
            })
          );
        });
        elements.push(new Paragraph({ text: '', spacing: { after: 80 } }));
        break;
      }

      case 'checklist': {
        const checkItems: { text: string; checked: boolean }[] = (block.data as any).items || [];
        checkItems.forEach((ci) => {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${ci.checked ? '☑' : '☐'}  ${stripHtml(ci.text)}`,
                  size: 24,
                }),
              ],
              indent: { left: 360 },
              spacing: { after: 80 },
            })
          );
        });
        elements.push(new Paragraph({ text: '', spacing: { after: 80 } }));
        break;
      }

      case 'quote': {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `"${stripHtml((block.data as any).text || '')}"`,
                italics: true,
                size: 24,
                color: '555555',
              }),
            ],
            indent: { left: 720, right: 720 },
            shading: { type: ShadingType.SOLID, color: 'F4F7FF', fill: 'F4F7FF' },
            spacing: { before: 160, after: 160 },
          })
        );
        break;
      }

      case 'delimiter': {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─',
                color: 'CCCCCC',
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          })
        );
        break;
      }

      case 'code': {
        const codeText: string = (block.data as any).code || '';
        const lang: string = (block.data as any).language || '';
        if (lang) {
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: lang, bold: true, size: 18, color: '888888' })],
              spacing: { before: 160, after: 40 },
            })
          );
        }
        codeText.split('\n').forEach((line: string) => {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({ text: line || ' ', font: 'Courier New', size: 20, color: '1a1a1a' }),
              ],
              indent: { left: 360 },
              shading: { type: ShadingType.SOLID, color: 'F5F5F5', fill: 'F5F5F5' },
              spacing: { after: 0 },
            })
          );
        });
        elements.push(new Paragraph({ text: '', spacing: { after: 160 } }));
        break;
      }

      case 'callout': {
        const icon: string = (block.data as any).icon || '💡';
        const callText = stripHtml((block.data as any).text || '');
        elements.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${icon}  `, size: 24 }),
              new TextRun({ text: callText, size: 24, italics: true }),
            ],
            indent: { left: 360 },
            shading: { type: ShadingType.SOLID, color: 'FFF8E1', fill: 'FFF8E1' },
            spacing: { before: 160, after: 160 },
          })
        );
        break;
      }

      case 'table': {
        const rows: string[][] = (block.data as any).content || [];
        const withHeadings: boolean = (block.data as any).withHeadings || false;
        if (rows.length > 0) {
          const tableObj = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(
              (row, rowIndex) =>
                new TableRow({
                  tableHeader: rowIndex === 0 && withHeadings,
                  children: row.map(
                    (cell) => {
                      const isHeader = rowIndex === 0 && withHeadings;
                      return new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: stripHtml(cell),
                                bold: isHeader,
                                size: isHeader ? 24 : 22,
                                color: isHeader ? '1a1a2e' : '333333',
                              }),
                            ],
                          }),
                        ],
                        shading: isHeader
                          ? { type: ShadingType.SOLID, color: 'C5D8FF', fill: 'C5D8FF' }
                          : rowIndex % 2 === 0
                            ? { type: ShadingType.SOLID, color: 'FFFFFF', fill: 'FFFFFF' }
                            : { type: ShadingType.SOLID, color: 'F0F5FF', fill: 'F0F5FF' },
                        borders: cellBorder,
                        margins: { top: 80, bottom: 80, left: 120, right: 120 },
                      });
                    }
                  ),
                })
            ),
          });
          elements.push(new Paragraph({ text: '', spacing: { before: 160 } }));
          elements.push(tableObj);
          elements.push(new Paragraph({ text: '', spacing: { after: 160 } }));
        }
        break;
      }

      default: {
        const raw = (block.data as any).text || '';
        if (raw.trim()) {
          const runs = parseInlineHtml(raw);
          elements.push(
            new Paragraph({ children: runs, spacing: { after: 160 } })
          );
        }
        break;
      }
    }
  }

  return elements;
}

export async function exportAsDocx(
  artifact: ArtifactData,
  blocks: EditorJSBlock[],
  editableTitle: string,
  editableSubtitle: string
): Promise<void> {
  const cleanTitle = editableTitle
    ? editableTitle.replace(/<[^>]*>/g, '')
    : artifact.metadata.titulo;
  const cleanSubtitle = editableSubtitle
    ? editableSubtitle.replace(/<[^>]*>/g, '')
    : (artifact.metadata.subtitulo || '');

  const date = new Date(artifact.metadata.geradoEm).toLocaleDateString('pt-BR');
  const contentElements = buildDocxElements(blocks);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: cleanTitle, bold: true, size: 40, color: '111111' }),
            ],
            spacing: { after: 160 },
          }),
          ...(cleanSubtitle
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: cleanSubtitle, italics: true, size: 26, color: '666666' }),
                  ],
                  spacing: { after: 120 },
                }),
              ]
            : []),
          new Paragraph({
            children: [
              new TextRun({ text: `Gerado em: ${date}`, size: 18, color: '999999' }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '─────────────────────────────────────────────────────────────',
                color: 'DDDDDD',
                size: 16,
              }),
            ],
            spacing: { after: 400 },
          }),
          ...contentElements,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFileName(cleanTitle) || 'documento'}.docx`);
}
