import jsPDF from 'jspdf';
import { ActivityDownloadData, DownloadOptions, DownloadResult } from '../types';
import { formatDate, generateFileName, stripHtml } from '../utils/formatters';

export const downloadFlashCardsAsPDF = async (
  data: ActivityDownloadData,
  options: DownloadOptions = { format: 'pdf' }
): Promise<DownloadResult> => {
  try {
    console.log('📥 Iniciando download de Flash Cards como PDF...', data);

    const cards = data.cards || data.flashcards || [];
    
    if (cards.length === 0) {
      return {
        success: false,
        error: 'Nenhum flash card encontrado para download'
      };
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const cardWidth = 120;
    const cardHeight = 80;
    const margin = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(data.title || 'Flash Cards', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${formatDate()} | Total de cards: ${cards.length}`, pageWidth / 2, 23, { align: 'center' });

    cards.forEach((card: any, index: number) => {
      if (index > 0) {
        doc.addPage();
      }

      doc.setFillColor(255, 248, 240);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;

      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(1);
      doc.roundedRect(
        centerX - cardWidth / 2,
        centerY - cardHeight / 2,
        cardWidth,
        cardHeight,
        5,
        5,
        'S'
      );

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        centerX - cardWidth / 2 + 2,
        centerY - cardHeight / 2 + 2,
        cardWidth - 4,
        cardHeight - 4,
        4,
        4,
        'F'
      );

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 140, 0);
      doc.text(`Card ${index + 1} - FRENTE`, centerX, centerY - cardHeight / 2 + 12, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const frontText = stripHtml(card.front || card.frente || 'Sem conteúdo');
      const frontLines = doc.splitTextToSize(frontText, cardWidth - 20);
      const frontTextY = centerY - (frontLines.length * 3.5);
      doc.text(frontLines, centerX, frontTextY, { align: 'center', maxWidth: cardWidth - 20 });

      doc.addPage();

      doc.setFillColor(248, 250, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.roundedRect(
        centerX - cardWidth / 2,
        centerY - cardHeight / 2,
        cardWidth,
        cardHeight,
        5,
        5,
        'S'
      );

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        centerX - cardWidth / 2 + 2,
        centerY - cardHeight / 2 + 2,
        cardWidth - 4,
        cardHeight - 4,
        4,
        4,
        'F'
      );

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(`Card ${index + 1} - VERSO`, centerX, centerY - cardHeight / 2 + 12, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const backText = stripHtml(card.back || card.verso || 'Sem conteúdo');
      const backLines = doc.splitTextToSize(backText, cardWidth - 20);
      const backTextY = centerY - (backLines.length * 3.5);
      doc.text(backLines, centerX, backTextY, { align: 'center', maxWidth: cardWidth - 20 });

      if (card.category || card.categoria) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(`Categoria: ${card.category || card.categoria}`, centerX, centerY + cardHeight / 2 - 8, { align: 'center' });
      }
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    const fileName = options.fileName || generateFileName(data.title || 'Flash_Cards', 'pdf');
    doc.save(fileName);

    console.log('✅ Download de Flash Cards concluído com sucesso!');
    return {
      success: true,
      message: 'Flash Cards baixados com sucesso!'
    };

  } catch (error) {
    console.error('❌ Erro ao gerar download de Flash Cards:', error);
    return {
      success: false,
      error: 'Erro ao gerar arquivo PDF. Tente novamente.'
    };
  }
};
