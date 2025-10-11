
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DownloadConfig {
  activityType: string;
  format: 'pdf' | 'docx' | 'png' | 'json';
  fileName: string;
}

/**
 * Sistema de Download de Atividades School Power
 * Gerencia o download de atividades em diferentes formatos
 */
export class DownloadActivityService {
  
  /**
   * Baixa uma atividade no formato apropriado
   */
  static async downloadActivity(activityId: string, activityData: any, activityType: string) {
    console.log(`📥 Iniciando download da atividade: ${activityType}`);
    
    const config = this.getDownloadConfig(activityType);
    
    try {
      switch (config.format) {
        case 'pdf':
          await this.downloadAsPDF(activityData, config.fileName);
          break;
        case 'docx':
          await this.downloadAsWord(activityData, config.fileName);
          break;
        case 'png':
          await this.downloadAsPNG(activityData, config.fileName);
          break;
        case 'json':
          this.downloadAsJSON(activityData, config.fileName);
          break;
        default:
          throw new Error(`Formato ${config.format} não suportado`);
      }
      
      console.log(`✅ Download concluído: ${config.fileName}`);
    } catch (error) {
      console.error(`❌ Erro ao baixar atividade:`, error);
      throw error;
    }
  }

  /**
   * Retorna configuração de download para cada tipo de atividade
   */
  private static getDownloadConfig(activityType: string): DownloadConfig {
    const configs: Record<string, DownloadConfig> = {
      'lista-exercicios': {
        activityType: 'lista-exercicios',
        format: 'pdf',
        fileName: 'Lista_de_Exercicios.pdf'
      },
      'plano-aula': {
        activityType: 'plano-aula',
        format: 'pdf',
        fileName: 'Plano_de_Aula.pdf'
      },
      'sequencia-didatica': {
        activityType: 'sequencia-didatica',
        format: 'pdf',
        fileName: 'Sequencia_Didatica.pdf'
      },
      'quiz-interativo': {
        activityType: 'quiz-interativo',
        format: 'pdf',
        fileName: 'Quiz_Interativo.pdf'
      },
      'flash-cards': {
        activityType: 'flash-cards',
        format: 'pdf',
        fileName: 'Flash_Cards.pdf'
      }
    };

    return configs[activityType] || {
      activityType,
      format: 'json',
      fileName: `${activityType}.json`
    };
  }

  /**
   * Download como PDF
   */
  private static async downloadAsPDF(data: any, fileName: string) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);

    // Título
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.title || data.titulo || 'Atividade', margin, yPosition);
    yPosition += 10;

    // Linha separadora
    pdf.setDrawColor(255, 140, 0); // Laranja
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Conteúdo baseado no tipo
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    if (data.questoes || data.questions) {
      // Lista de Exercícios / Quiz
      const questions = data.questoes || data.questions || [];
      questions.forEach((questao: any, index: number) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        // Número da questão
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. `, margin, yPosition);
        
        // Enunciado
        pdf.setFont('helvetica', 'normal');
        const enunciado = questao.enunciado || questao.question || questao.text || '';
        const splitEnunciado = pdf.splitTextToSize(enunciado, contentWidth - 10);
        pdf.text(splitEnunciado, margin + 7, yPosition);
        yPosition += splitEnunciado.length * 6;

        // Alternativas (se houver)
        if (questao.alternativas || questao.options) {
          const alternativas = questao.alternativas || questao.options || [];
          alternativas.forEach((alt: string, altIndex: number) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }
            const letra = String.fromCharCode(65 + altIndex);
            const splitAlt = pdf.splitTextToSize(`${letra}) ${alt}`, contentWidth - 15);
            pdf.text(splitAlt, margin + 10, yPosition);
            yPosition += splitAlt.length * 6;
          });
        }

        yPosition += 5;
      });
    } else if (data.cards || data.flashcards) {
      // Flash Cards
      const cards = data.cards || data.flashcards || [];
      cards.forEach((card: any, index: number) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        // Frente do card
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Card ${index + 1} - Frente:`, margin, yPosition);
        yPosition += 7;
        
        pdf.setFont('helvetica', 'normal');
        const splitFront = pdf.splitTextToSize(card.front || card.frente || '', contentWidth);
        pdf.text(splitFront, margin + 5, yPosition);
        yPosition += splitFront.length * 6 + 3;

        // Verso do card
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Verso:`, margin, yPosition);
        yPosition += 7;
        
        pdf.setFont('helvetica', 'normal');
        const splitBack = pdf.splitTextToSize(card.back || card.verso || '', contentWidth);
        pdf.text(splitBack, margin + 5, yPosition);
        yPosition += splitBack.length * 6 + 10;
      });
    } else if (data.aulas) {
      // Sequência Didática
      const aulas = data.aulas || [];
      aulas.forEach((aula: any, index: number) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.text(`Aula ${index + 1}: ${aula.titulo || aula.title || ''}`, margin, yPosition);
        yPosition += 10;

        pdf.setFont('helvetica', 'normal');
        if (aula.objetivos) {
          const splitObj = pdf.splitTextToSize(`Objetivos: ${aula.objetivos}`, contentWidth);
          pdf.text(splitObj, margin + 5, yPosition);
          yPosition += splitObj.length * 6 + 5;
        }

        if (aula.conteudo) {
          const splitCont = pdf.splitTextToSize(`Conteúdo: ${aula.conteudo}`, contentWidth);
          pdf.text(splitCont, margin + 5, yPosition);
          yPosition += splitCont.length * 6 + 10;
        }
      });
    } else {
      // Plano de Aula ou genérico
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 0 && key !== 'id') {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFont('helvetica', 'bold');
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
          pdf.text(`${label}:`, margin, yPosition);
          yPosition += 7;

          pdf.setFont('helvetica', 'normal');
          const splitText = pdf.splitTextToSize(value, contentWidth);
          pdf.text(splitText, margin + 5, yPosition);
          yPosition += splitText.length * 6 + 7;
        }
      });
    }

    // Rodapé
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.text(
        `Página ${i} de ${totalPages} - Gerado por School Power`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    pdf.save(fileName);
  }

  /**
   * Download como Word (DOCX)
   */
  private static async downloadAsWord(data: any, fileName: string) {
    // Criar conteúdo HTML estruturado
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #ff8c00; border-bottom: 2px solid #ff8c00; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 20px; }
          .question { margin: 15px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #ff8c00; }
          .alternative { margin-left: 20px; }
        </style>
      </head>
      <body>
        <h1>${data.title || data.titulo || 'Atividade'}</h1>
    `;

    if (data.questoes || data.questions) {
      const questions = data.questoes || data.questions || [];
      questions.forEach((q: any, i: number) => {
        htmlContent += `
          <div class="question">
            <strong>${i + 1}.</strong> ${q.enunciado || q.question || ''}
            ${q.alternativas ? q.alternativas.map((alt: string, j: number) => 
              `<div class="alternative">${String.fromCharCode(65 + j)}) ${alt}</div>`
            ).join('') : ''}
          </div>
        `;
      });
    }

    htmlContent += '</body></html>';

    // Criar blob e download
    const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.docx', '.html'); // Fallback para HTML
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download como PNG (captura de tela)
   */
  private static async downloadAsPNG(data: any, fileName: string) {
    // Criar elemento temporário com o conteúdo
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '20px';
    tempDiv.style.background = 'white';
    tempDiv.innerHTML = `
      <h1 style="color: #ff8c00;">${data.title || data.titulo || 'Atividade'}</h1>
      <div>${JSON.stringify(data, null, 2)}</div>
    `;
    
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      });
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * Download como JSON
   */
  private static downloadAsJSON(data: any, fileName: string) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
