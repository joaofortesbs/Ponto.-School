import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { ActivityDownloadData, DownloadOptions, DownloadResult } from '../types';
import { formatDate, generateFileName, stripHtml } from '../utils/formatters';

export const downloadPlanoAulaAsWord = async (
  data: ActivityDownloadData,
  options: DownloadOptions = { format: 'docx' }
): Promise<DownloadResult> => {
  try {
    console.log('📥 Iniciando download de Plano de Aula como Word...', data);

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'PLANO DE AULA',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          new Paragraph({
            text: data.title || data.titulo || 'Sem título',
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
                    children: [new Paragraph({ text: 'Ano Escolar:', bold: true } as any)]
                  }),
                  new TableCell({
                    children: [new Paragraph(data.customFields?.anoEscolar || data.anoEscolar || data.ano_escolar || 'Não especificado')]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Duração:', bold: true } as any)]
                  }),
                  new TableCell({
                    children: [new Paragraph(data.customFields?.duracao || data.duracao || 'Não especificada')]
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

          ...(data.customFields?.tema || data.tema ? [
            new Paragraph({
              text: 'Tema / Tópico Central',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
              text: stripHtml(data.customFields?.tema || data.tema),
              spacing: { after: 300 }
            })
          ] : []),

          ...(data.customFields?.objetivos || data.objetivos ? [
            new Paragraph({
              text: 'Objetivos de Aprendizagem',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
              text: stripHtml(data.customFields?.objetivos || data.objetivos),
              spacing: { after: 300 }
            })
          ] : []),

          ...(data.customFields?.habilidadesBNCC || data.habilidadesBNCC ? [
            new Paragraph({
              text: 'Habilidades da BNCC',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
              text: stripHtml(data.customFields?.habilidadesBNCC || data.habilidadesBNCC),
              spacing: { after: 300 }
            })
          ] : []),

          ...(data.customFields?.metodologia || data.metodologia ? [
            new Paragraph({
              text: 'Metodologia',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
              text: stripHtml(data.customFields?.metodologia || data.metodologia),
              spacing: { after: 300 }
            })
          ] : []),

          ...(data.customFields?.desenvolvimento || data.desenvolvimento ? [
            new Paragraph({
              text: 'Desenvolvimento da Aula',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
              text: stripHtml(data.customFields?.desenvolvimento || data.desenvolvimento),
              spacing: { after: 300 }
            })
          ] : []),

          ...(data.customFields?.recursos || data.recursos ? [
            new Paragraph({
              text: 'Recursos Didáticos',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
              text: stripHtml(data.customFields?.recursos || data.recursos),
              spacing: { after: 300 }
            })
          ] : []),

          ...(data.customFields?.avaliacao || data.avaliacao ? [
            new Paragraph({
              text: 'Avaliação',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
              text: stripHtml(data.customFields?.avaliacao || data.avaliacao),
              spacing: { after: 300 }
            })
          ] : []),

          ...(data.customFields?.observacoes || data.observacoes ? [
            new Paragraph({
              text: 'Observações',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
              text: stripHtml(data.customFields?.observacoes || data.observacoes),
              spacing: { after: 300 }
            })
          ] : [])
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = options.fileName || generateFileName(data.title || 'Plano_de_Aula', 'docx');
    saveAs(blob, fileName);

    console.log('✅ Download de Plano de Aula concluído com sucesso!');
    return {
      success: true,
      message: 'Plano de Aula baixado com sucesso!'
    };

  } catch (error) {
    console.error('❌ Erro ao gerar download de Plano de Aula:', error);
    return {
      success: false,
      error: 'Erro ao gerar arquivo Word. Tente novamente.'
    };
  }
};
