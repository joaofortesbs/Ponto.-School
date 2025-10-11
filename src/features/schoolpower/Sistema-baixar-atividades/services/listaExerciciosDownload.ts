import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { ActivityDownloadData, DownloadOptions, DownloadResult } from '../types';
import { formatDate, generateFileName, stripHtml, getDifficultyLabel } from '../utils/formatters';

export const downloadListaExerciciosAsWord = async (
  data: ActivityDownloadData,
  options: DownloadOptions = { format: 'docx' }
): Promise<DownloadResult> => {
  try {
    console.log('📥 Iniciando download de Lista de Exercícios como Word...', data);

    let questions = data.questoes || data.questions || data.content?.questoes || data.content?.questions || [];
    
    if (data.deletedQuestionIds && Array.isArray(data.deletedQuestionIds)) {
      console.log('🗑️ Filtrando questões deletadas:', data.deletedQuestionIds);
      questions = questions.filter(q => !data.deletedQuestionIds.includes(q.id));
    }
    
    if (questions.length === 0) {
      return {
        success: false,
        error: 'Nenhuma questão encontrada para download'
      };
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: data.title || 'Lista de Exercícios',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 300
            }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Disciplina: ${data.customFields?.disciplina || data.disciplina || 'Não especificada'}`,
                bold: true
              })
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Ano Escolar: ${data.customFields?.anoEscolar || data.anoEscolar || 'Não especificado'}`,
                bold: true
              })
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Data: ${formatDate()}`,
                bold: true
              })
            ],
            spacing: { after: 400 }
          }),

          ...(data.description ? [
            new Paragraph({
              text: 'Descrição:',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: stripHtml(data.description),
              spacing: { after: 400 }
            })
          ] : []),

          new Paragraph({
            text: 'Questões:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 }
          }),

          ...questions.flatMap((questao: any, index: number) => {
            const questionParagraphs = [];

            questionParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. `,
                    bold: true,
                    size: 24
                  }),
                  new TextRun({
                    text: stripHtml(questao.enunciado || questao.statement || questao.question || 'Sem enunciado'),
                    size: 24
                  })
                ],
                spacing: { before: 300, after: 150 }
              })
            );

            if (questao.dificuldade || questao.difficulty) {
              const difficulty = questao.dificuldade || questao.difficulty;
              questionParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Dificuldade: ${getDifficultyLabel(difficulty)}`,
                      italics: true,
                      size: 20
                    })
                  ],
                  spacing: { after: 100 }
                })
              );
            }

            if (questao.type === 'multipla-escolha' || questao.tipo === 'multipla-escolha') {
              const opcoes = questao.opcoes || questao.options || [];
              opcoes.forEach((opcao: any, opIndex: number) => {
                const letra = String.fromCharCode(65 + opIndex);
                questionParagraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${letra}) `,
                        bold: true
                      }),
                      new TextRun({
                        text: stripHtml(opcao.texto || opcao.text || opcao)
                      })
                    ],
                    spacing: { before: 50, after: 50 },
                    indent: { left: 720 }
                  })
                );
              });
            }

            if (options.includeAnswers && (questao.respostaCorreta || questao.correctAnswer || questao.gabarito)) {
              questionParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Resposta: ${questao.respostaCorreta || questao.correctAnswer || questao.gabarito}`,
                      bold: true,
                      color: '008000'
                    })
                  ],
                  spacing: { before: 100, after: 100 },
                  indent: { left: 720 }
                })
              );
            }

            if (questao.explicacao || questao.explanation) {
              questionParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Explicação: ',
                      bold: true,
                      italics: true
                    }),
                    new TextRun({
                      text: stripHtml(questao.explicacao || questao.explanation),
                      italics: true
                    })
                  ],
                  spacing: { before: 100, after: 200 },
                  indent: { left: 720 }
                })
              );
            }

            return questionParagraphs;
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = options.fileName || generateFileName(data.title || 'Lista_de_Exercicios', 'docx');
    saveAs(blob, fileName);

    console.log('✅ Download de Lista de Exercícios concluído com sucesso!');
    return {
      success: true,
      message: 'Lista de Exercícios baixada com sucesso!'
    };

  } catch (error) {
    console.error('❌ Erro ao gerar download de Lista de Exercícios:', error);
    return {
      success: false,
      error: 'Erro ao gerar arquivo Word. Tente novamente.'
    };
  }
};
