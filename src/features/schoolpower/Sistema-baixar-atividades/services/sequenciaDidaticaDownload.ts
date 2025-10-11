import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { ActivityDownloadData, DownloadOptions, DownloadResult } from '../types';
import { formatDate, generateFileName, stripHtml } from '../utils/formatters';

export const downloadSequenciaDidaticaAsWord = async (
  data: ActivityDownloadData,
  options: DownloadOptions = { format: 'docx' }
): Promise<DownloadResult> => {
  try {
    console.log('📥 Iniciando download de Sequência Didática como Word...', data);

    const sequenciaData = data.sequenciaDidatica || data;
    const aulas = sequenciaData.aulas || [];
    const diagnosticos = sequenciaData.diagnosticos || [];
    const avaliacoes = sequenciaData.avaliacoes || [];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'SEQUÊNCIA DIDÁTICA',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          new Paragraph({
            text: sequenciaData.titulo || data.title || 'Sem título',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),

          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Disciplina:', bold: true } as any)],
                    width: { size: 30, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph(data.customFields?.disciplina || data.disciplina || 'Não especificada')],
                    width: { size: 70, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Total de Aulas:', bold: true } as any)]
                  }),
                  new TableCell({
                    children: [new Paragraph(String(aulas.length))]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Data:', bold: true } as any)]
                  }),
                  new TableCell({
                    children: [new Paragraph(formatDate())]
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            text: '',
            spacing: { after: 300 }
          }),

          ...(sequenciaData.descricaoGeral || data.description ? [
            new Paragraph({
              text: 'Descrição Geral',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
              text: stripHtml(sequenciaData.descricaoGeral || data.description),
              spacing: { after: 300 }
            })
          ] : []),

          ...(diagnosticos.length > 0 ? [
            new Paragraph({
              text: 'Diagnóstico Inicial',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            ...diagnosticos.flatMap((diag: any, index: number) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${diag.titulo || diag.title || 'Diagnóstico'}`,
                    bold: true
                  })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: stripHtml(diag.descricao || diag.description || ''),
                spacing: { after: 200 },
                indent: { left: 720 }
              })
            ])
          ] : []),

          new Paragraph({
            text: 'Aulas da Sequência',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),

          ...aulas.flatMap((aula: any, index: number) => [
            new Paragraph({
              text: `Aula ${index + 1}: ${aula.titulo || aula.title || 'Sem título'}`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 300, after: 150 }
            }),

            ...(aula.objetivos ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Objetivos: ',
                    bold: true
                  }),
                  new TextRun({
                    text: stripHtml(aula.objetivos)
                  })
                ],
                spacing: { after: 100 },
                indent: { left: 360 }
              })
            ] : []),

            ...(aula.duracao ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Duração: ',
                    bold: true
                  }),
                  new TextRun({
                    text: aula.duracao
                  })
                ],
                spacing: { after: 100 },
                indent: { left: 360 }
              })
            ] : []),

            ...(aula.conteudo || aula.desenvolvimento ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Desenvolvimento:',
                    bold: true
                  })
                ],
                spacing: { before: 150, after: 100 },
                indent: { left: 360 }
              }),
              new Paragraph({
                text: stripHtml(aula.conteudo || aula.desenvolvimento),
                spacing: { after: 200 },
                indent: { left: 720 }
              })
            ] : []),

            ...(aula.recursos ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Recursos: ',
                    bold: true
                  }),
                  new TextRun({
                    text: stripHtml(aula.recursos)
                  })
                ],
                spacing: { after: 100 },
                indent: { left: 360 }
              })
            ] : []),

            ...(aula.atividades ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Atividades: ',
                    bold: true
                  }),
                  new TextRun({
                    text: stripHtml(aula.atividades)
                  })
                ],
                spacing: { after: 200 },
                indent: { left: 360 }
              })
            ] : [])
          ]),

          ...(avaliacoes.length > 0 ? [
            new Paragraph({
              text: 'Avaliação',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 150 }
            }),
            ...avaliacoes.flatMap((aval: any, index: number) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${aval.titulo || aval.title || 'Avaliação'}`,
                    bold: true
                  })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: stripHtml(aval.descricao || aval.description || ''),
                spacing: { after: 200 },
                indent: { left: 720 }
              })
            ])
          ] : [])
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = options.fileName || generateFileName(data.title || 'Sequencia_Didatica', 'docx');
    saveAs(blob, fileName);

    console.log('✅ Download de Sequência Didática concluído com sucesso!');
    return {
      success: true,
      message: 'Sequência Didática baixada com sucesso!'
    };

  } catch (error) {
    console.error('❌ Erro ao gerar download de Sequência Didática:', error);
    return {
      success: false,
      error: 'Erro ao gerar arquivo Word. Tente novamente.'
    };
  }
};
