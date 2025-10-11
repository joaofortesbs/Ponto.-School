import jsPDF from 'jspdf';
import { ActivityDownloadData, DownloadOptions, DownloadResult } from '../types';
import { formatDate, generateFileName, stripHtml } from '../utils/formatters';

export const downloadQuizInterativoAsPDF = async (
  data: ActivityDownloadData,
  options: DownloadOptions = { format: 'pdf' }
): Promise<DownloadResult> => {
  try {
    console.log('📥 Iniciando download de Quiz Interativo como PDF...', data);

    const questions = data.questions || data.questoes || [];
    
    if (questions.length === 0) {
      return {
        success: false,
        error: 'Nenhuma questão encontrada para download'
      };
    }

    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.pageSize || 'a4'
    });

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - (margin * 2);

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(data.title || 'Quiz Interativo', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${formatDate()}`, margin, yPosition);
    
    yPosition += 10;

    if (data.description) {
      const descLines = doc.splitTextToSize(stripHtml(data.description), maxWidth);
      doc.text(descLines, margin, yPosition);
      yPosition += (descLines.length * 6) + 5;
    }

    yPosition += 10;
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    questions.forEach((question: any, index: number) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const questionText = `${index + 1}. ${stripHtml(question.question || question.text || question.enunciado || 'Sem enunciado')}`;
      const questionLines = doc.splitTextToSize(questionText, maxWidth);
      doc.text(questionLines, margin, yPosition);
      yPosition += (questionLines.length * 7) + 3;

      if (question.type === 'multipla-escolha' || question.tipo === 'multipla-escolha') {
        const questionOptions = question.options || question.opcoes || [];
        doc.setFont('helvetica', 'normal');
        
        questionOptions.forEach((option: any, optIndex: number) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }

          const optionLetter = String.fromCharCode(65 + optIndex);
          const optionText = `${optionLetter}) ${stripHtml(option.text || option.texto || option)}`;
          const optionLines = doc.splitTextToSize(optionText, maxWidth - 10);
          doc.text(optionLines, margin + 5, yPosition);
          yPosition += (optionLines.length * 6) + 2;
        });
      } else if (question.type === 'verdadeiro-falso' || question.tipo === 'verdadeiro-falso') {
        doc.setFont('helvetica', 'normal');
        doc.text('( ) Verdadeiro', margin + 5, yPosition);
        yPosition += 7;
        doc.text('( ) Falso', margin + 5, yPosition);
        yPosition += 7;
      }

      if (options.includeAnswers && question.correctAnswer) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 128, 0);
        const answerText = `Resposta correta: ${question.correctAnswer}`;
        doc.text(answerText, margin + 5, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 7;
      }

      yPosition += 8;
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    const fileName = options.fileName || generateFileName(data.title || 'Quiz_Interativo', 'pdf');
    doc.save(fileName);

    console.log('✅ Download de Quiz Interativo concluído com sucesso!');
    return {
      success: true,
      message: 'Quiz Interativo baixado com sucesso!'
    };

  } catch (error) {
    console.error('❌ Erro ao gerar download de Quiz Interativo:', error);
    return {
      success: false,
      error: 'Erro ao gerar arquivo PDF. Tente novamente.'
    };
  }
};
