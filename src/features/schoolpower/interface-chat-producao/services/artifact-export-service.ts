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

function buildContentHtml(blocks: EditorJSBlock[], title: string, subtitle: string): string {
  const cleanTitle = title.replace(/<[^>]*>/g, '');
  const cleanSubtitle = subtitle.replace(/<[^>]*>/g, '');
  let body = '';

  for (const block of blocks) {
    switch (block.type) {
      case 'header': {
        const level = (block.data as any).level || 2;
        const text = (block.data as any).text || '';
        body += `<h${level}>${text}</h${level}>\n`;
        break;
      }
      case 'paragraph':
        body += `<p>${(block.data as any).text || ''}</p>\n`;
        break;
      case 'list': {
        const items: string[] = (block.data as any).items || [];
        const tag = (block.data as any).style === 'ordered' ? 'ol' : 'ul';
        body += `<${tag}>${items.map((i) => `<li>${i}</li>`).join('')}</${tag}>\n`;
        break;
      }
      case 'checklist': {
        const checkItems: { text: string; checked: boolean }[] = (block.data as any).items || [];
        body += '<ul style="list-style:none;padding-left:0;">';
        for (const ci of checkItems) {
          body += `<li>${ci.checked ? '☑' : '☐'} ${ci.text}</li>`;
        }
        body += '</ul>\n';
        break;
      }
      case 'quote':
        body += `<blockquote style="border-left:3px solid #666;padding-left:12px;margin:12px 0;color:#555;font-style:italic;">${(block.data as any).text || ''}</blockquote>\n`;
        break;
      case 'delimiter':
        body += '<hr style="margin:24px 0;border:none;border-top:1px solid #ddd;"/>\n';
        break;
      case 'table': {
        const rows: string[][] = (block.data as any).content || [];
        if (rows.length > 0) {
          body += '<table style="width:100%;border-collapse:collapse;margin:16px 0;">';
          rows.forEach((row, ri) => {
            const tag = ri === 0 && (block.data as any).withHeadings ? 'th' : 'td';
            body += '<tr>';
            row.forEach((cell) => {
              body += `<${tag} style="border:1px solid #ddd;padding:8px;text-align:left;">${cell}</${tag}>`;
            });
            body += '</tr>';
          });
          body += '</table>\n';
        }
        break;
      }
      case 'code':
        body += `<pre style="background:#f5f5f5;padding:12px;border-radius:4px;overflow-x:auto;font-size:13px;"><code>${(block.data as any).code || ''}</code></pre>\n`;
        break;
      case 'callout':
        body += `<div style="background:#f0f4ff;border-left:4px solid #4f8ef7;padding:12px;margin:12px 0;border-radius:4px;">${(block.data as any).icon || ''} ${(block.data as any).text || ''}</div>\n`;
        break;
      default:
        if ((block.data as any).text) {
          body += `<p>${(block.data as any).text}</p>\n`;
        }
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${cleanTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Georgia&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia','Palatino Linotype',serif;
      color: #1a1a1a;
      line-height: 1.7;
      padding: 48px;
      max-width: 780px;
      margin: 0 auto;
      background: #ffffff;
    }
    h1 { font-family:'Inter',sans-serif; font-size:28px; font-weight:700; margin-bottom:8px; color:#111; }
    h2 { font-family:'Inter',sans-serif; font-size:22px; font-weight:600; margin:28px 0 12px; color:#222; }
    h3 { font-family:'Inter',sans-serif; font-size:18px; font-weight:600; margin:24px 0 10px; color:#333; }
    h4,h5,h6 { font-family:'Inter',sans-serif; margin:20px 0 8px; color:#444; }
    p { margin:10px 0; font-size:15px; }
    ul,ol { margin:10px 0; padding-left:28px; }
    li { margin:4px 0; font-size:15px; }
    .subtitle { font-size:16px; color:#666; margin-bottom:32px; font-style:italic; }
    .header-line { width:60px; height:3px; background:#e67e22; margin:16px 0 32px; border-radius:2px; }
    @media print { body { padding:24px; } @page { margin:2cm; } }
  </style>
</head>
<body>
  <h1>${cleanTitle}</h1>
  ${cleanSubtitle ? `<p class="subtitle">${cleanSubtitle}</p>` : ''}
  <div class="header-line"></div>
  ${body}
</body>
</html>`;
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

  const htmlContent = buildContentHtml(blocks, cleanTitle, cleanSubtitle);

  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.cssText =
    'position:absolute;left:-9999px;top:0;width:794px;background:#ffffff;';
  document.body.appendChild(container);

  try {
    const html2pdf = (await import('html2pdf.js')).default;
    const filename = `${sanitizeFileName(cleanTitle) || 'documento'}.pdf`;

    await html2pdf()
      .from(container)
      .set({
        margin: [15, 15, 20, 15],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .save();
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

function buildDocxElements(blocks: EditorJSBlock[]): DocxElement[] {
  const elements: DocxElement[] = [];

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
            spacing: { before: 240, after: 120 },
          })
        );
        break;
      }

      case 'paragraph': {
        const text = stripHtml((block.data as any).text || '');
        if (text.trim()) {
          elements.push(
            new Paragraph({
              children: [new TextRun({ text, size: 24 })],
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
                text: '─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─',
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
        const text = stripHtml((block.data as any).text || '');
        elements.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${icon}  `, size: 24 }),
              new TextRun({ text, size: 24, italics: true }),
            ],
            indent: { left: 360 },
            shading: { type: ShadingType.SOLID, color: 'EEF3FF', fill: 'EEF3FF' },
            spacing: { before: 160, after: 160 },
          })
        );
        break;
      }

      case 'table': {
        const rows: string[][] = (block.data as any).content || [];
        const withHeadings: boolean = (block.data as any).withHeadings || false;
        if (rows.length > 0) {
          const border = {
            top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          };
          const tableObj = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(
              (row, rowIndex) =>
                new TableRow({
                  children: row.map(
                    (cell) =>
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: stripHtml(cell),
                                bold: rowIndex === 0 && withHeadings,
                                size: 22,
                              }),
                            ],
                          }),
                        ],
                        shading:
                          rowIndex === 0 && withHeadings
                            ? { type: ShadingType.SOLID, color: 'F0F4FF', fill: 'F0F4FF' }
                            : undefined,
                        borders: border,
                      })
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
        const text = stripHtml((block.data as any).text || '');
        if (text.trim()) {
          elements.push(
            new Paragraph({ children: [new TextRun({ text, size: 24 })], spacing: { after: 160 } })
          );
        }
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
                text: '────────────────────────────────────────────────────────────────────────',
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

export function buildMarkdownContent(
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
        md += `${'#'.repeat(level)} ${stripHtml((block.data as any).text || '')}\n\n`;
        break;
      }
      case 'paragraph':
        md += `${stripHtml((block.data as any).text || '')}\n\n`;
        break;
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
      case 'quote':
        md += `> ${stripHtml((block.data as any).text || '')}\n\n`;
        break;
      case 'delimiter':
        md += '---\n\n';
        break;
      case 'table': {
        const rows: string[][] = (block.data as any).content || [];
        const withHeadings: boolean = (block.data as any).withHeadings || false;
        rows.forEach((row, ri) => {
          md += `| ${row.map((c) => stripHtml(c)).join(' | ')} |\n`;
          if (ri === 0 && withHeadings) {
            md += `| ${row.map(() => '---').join(' | ')} |\n`;
          }
        });
        if (rows.length) md += '\n';
        break;
      }
      case 'code':
        md += `\`\`\`${(block.data as any).language || ''}\n${(block.data as any).code || ''}\n\`\`\`\n\n`;
        break;
      case 'callout': {
        const icon = (block.data as any).icon || '';
        md += `> ${icon} **Nota:** ${stripHtml((block.data as any).text || '')}\n\n`;
        break;
      }
      default:
        if ((block.data as any).text) {
          md += `${stripHtml((block.data as any).text)}\n\n`;
        }
    }
  }

  return md;
}

export function getExportFilename(artifact: ArtifactData, editableTitle: string, ext: string): string {
  const cleanTitle = editableTitle
    ? editableTitle.replace(/<[^>]*>/g, '')
    : artifact.metadata.titulo;
  return `${sanitizeFileName(cleanTitle) || 'documento'}.${ext}`;
}
