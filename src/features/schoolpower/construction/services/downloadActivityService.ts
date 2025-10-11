
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
    console.log(`📊 Dados recebidos:`, activityData);
    
    // Extrair dados reais da atividade do localStorage se necessário
    let dadosReais = activityData;
    
    // Tentar múltiplas fontes de dados
    if (!dadosReais || Object.keys(dadosReais).length === 0) {
      const storageKey = `constructed_${activityType}_${activityId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          dadosReais = parsed.data || parsed;
          console.log(`✅ Dados recuperados do localStorage:`, dadosReais);
        } catch (e) {
          console.error('Erro ao parsear dados do localStorage:', e);
        }
      }
    }
    
    // Se ainda não tiver dados, buscar do content gerado
    if (!dadosReais?.questoes && !dadosReais?.aulas && !dadosReais?.cards) {
      const contentKey = `schoolpower_${activityType}_content`;
      const contentData = localStorage.getItem(contentKey);
      
      if (contentData) {
        try {
          const parsed = JSON.parse(contentData);
          dadosReais = { ...dadosReais, ...parsed };
          console.log(`✅ Dados de conteúdo mesclados:`, dadosReais);
        } catch (e) {
          console.error('Erro ao parsear dados de conteúdo:', e);
        }
      }
    }
    
    const config = this.getDownloadConfig(activityType);
    
    try {
      switch (config.format) {
        case 'pdf':
          await this.downloadAsPDF(dadosReais, config.fileName);
          break;
        case 'docx':
          await this.downloadAsWord(dadosReais, config.fileName);
          break;
        case 'png':
          await this.downloadAsPNG(dadosReais, config.fileName);
          break;
        case 'json':
          this.downloadAsJSON(dadosReais, config.fileName);
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
        format: 'docx',
        fileName: 'Lista_de_Exercicios.docx'
      },
      'plano-aula': {
        activityType: 'plano-aula',
        format: 'docx',
        fileName: 'Plano_de_Aula.docx'
      },
      'sequencia-didatica': {
        activityType: 'sequencia-didatica',
        format: 'docx',
        fileName: 'Sequencia_Didatica.docx'
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
    console.log('📝 Gerando arquivo Word para:', fileName);
    console.log('📊 Dados recebidos:', data);
    
    // Normalizar dados - tentar extrair de diferentes estruturas
    let dadosNormalizados = data;
    
    // Se data tem content, extrair
    if (data?.content && typeof data.content === 'object') {
      dadosNormalizados = { ...data, ...data.content };
    }
    
    // Se tem data dentro de data, extrair
    if (data?.data && typeof data.data === 'object') {
      dadosNormalizados = { ...dadosNormalizados, ...data.data };
    }
    
    console.log('📊 Dados normalizados:', dadosNormalizados);

    // Criar conteúdo HTML estruturado com estilos profissionais
    let htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head>
        <meta charset="UTF-8">
        <title>${dadosNormalizados.title || dadosNormalizados.titulo || 'Atividade School Power'}</title>
        <style>
          @page { margin: 2cm; }
          body { 
            font-family: 'Calibri', 'Arial', sans-serif; 
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
          }
          h1 { 
            color: #ff8c00; 
            border-bottom: 3px solid #ff8c00; 
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 24pt;
          }
          h2 { 
            color: #ff8c00; 
            margin-top: 25px;
            margin-bottom: 15px;
            font-size: 18pt;
            border-left: 4px solid #ff8c00;
            padding-left: 10px;
          }
          h3 {
            color: #555;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 14pt;
          }
          .metadata {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 25px;
            border: 1px solid #ddd;
          }
          .metadata-item {
            margin: 8px 0;
          }
          .metadata-label {
            font-weight: bold;
            color: #ff8c00;
            display: inline-block;
            min-width: 150px;
          }
          .question { 
            margin: 20px 0; 
            padding: 15px; 
            background: #f9f9f9; 
            border-left: 4px solid #ff8c00;
            page-break-inside: avoid;
          }
          .question-header {
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            font-size: 12pt;
          }
          .alternative { 
            margin: 8px 0 8px 25px;
            padding: 5px;
          }
          .section {
            margin: 25px 0;
            page-break-inside: avoid;
          }
          .subsection {
            margin: 15px 0;
            padding: 10px;
            background: #fafafa;
            border-left: 3px solid #ddd;
          }
          .objective-item {
            margin: 10px 0;
            padding: 10px;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 3px;
          }
          .aula-card {
            margin: 20px 0;
            padding: 15px;
            border: 2px solid #ff8c00;
            border-radius: 5px;
            page-break-inside: avoid;
          }
          .aula-header {
            background: #ff8c00;
            color: white;
            padding: 10px;
            margin: -15px -15px 15px -15px;
            border-radius: 3px 3px 0 0;
            font-weight: bold;
            font-size: 14pt;
          }
          .content-block {
            margin: 15px 0;
            padding: 12px;
            background: #f5f5f5;
            border-radius: 3px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ff8c00;
            text-align: center;
            color: #666;
            font-style: italic;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background: #ff8c00;
            color: white;
            font-weight: bold;
          }
          .card {
            margin: 15px 0;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            background: #fff;
          }
          .card-front, .card-back {
            padding: 10px;
            margin: 5px 0;
          }
          .card-front {
            background: #e3f2fd;
            border-left: 3px solid #2196f3;
          }
          .card-back {
            background: #f3e5f5;
            border-left: 3px solid #9c27b0;
          }
        </style>
      </head>
      <body>
    `;

    // TÍTULO PRINCIPAL
    htmlContent += `<h1>${dadosNormalizados.title || dadosNormalizados.titulo || 'Atividade School Power'}</h1>`;

    // METADADOS GERAIS
    htmlContent += `<div class="metadata">`;
    
    if (dadosNormalizados.disciplina || dadosNormalizados.subject) {
      htmlContent += `<div class="metadata-item"><span class="metadata-label">Disciplina:</span> ${dadosNormalizados.disciplina || dadosNormalizados.subject}</div>`;
    }
    if (dadosNormalizados.tema || dadosNormalizados.theme) {
      htmlContent += `<div class="metadata-item"><span class="metadata-label">Tema:</span> ${dadosNormalizados.tema || dadosNormalizados.theme}</div>`;
    }
    if (dadosNormalizados.anoSerie || dadosNormalizados.schoolYear || dadosNormalizados.serie) {
      htmlContent += `<div class="metadata-item"><span class="metadata-label">Ano/Série:</span> ${dadosNormalizados.anoSerie || dadosNormalizados.schoolYear || dadosNormalizados.serie}</div>`;
    }
    if (dadosNormalizados.descricao || dadosNormalizados.description) {
      htmlContent += `<div class="metadata-item"><span class="metadata-label">Descrição:</span> ${dadosNormalizados.descricao || dadosNormalizados.description}</div>`;
    }
    if (dadosNormalizados.tipoQuestoes) {
      htmlContent += `<div class="metadata-item"><span class="metadata-label">Tipo de Questões:</span> ${dadosNormalizados.tipoQuestoes}</div>`;
    }
    if (dadosNormalizados.numeroQuestoes) {
      htmlContent += `<div class="metadata-item"><span class="metadata-label">Número de Questões:</span> ${dadosNormalizados.numeroQuestoes}</div>`;
    }
    if (dadosNormalizados.dificuldade || dadosNormalizados.nivelDificuldade) {
      htmlContent += `<div class="metadata-item"><span class="metadata-label">Dificuldade:</span> ${dadosNormalizados.dificuldade || dadosNormalizados.nivelDificuldade}</div>`;
    }
    if (dadosNormalizados.tempoLimite) {
      htmlContent += `<div class="metadata-item"><span class="metadata-label">Tempo Limite:</span> ${dadosNormalizados.tempoLimite}</div>`;
    }
    
    htmlContent += `</div>`;

    // LISTA DE EXERCÍCIOS
    if (dadosNormalizados.questoes || dadosNormalizados.questions) {
      htmlContent += `<h2>Questões</h2>`;
      
      if (dadosNormalizados.objetivos) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Objetivos de Aprendizagem</h3>`;
        htmlContent += `<div class="content-block">${dadosNormalizados.objetivos}</div>`;
        htmlContent += `</div>`;
      }
      
      if (dadosNormalizados.conteudoPrograma) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Conteúdo Programático</h3>`;
        htmlContent += `<div class="content-block">${dadosNormalizados.conteudoPrograma}</div>`;
        htmlContent += `</div>`;
      }

      const questions = dadosNormalizados.questoes || dadosNormalizados.questions || [];
      questions.forEach((q: any, i: number) => {
        htmlContent += `<div class="question">`;
        htmlContent += `<div class="question-header">Questão ${i + 1}</div>`;
        htmlContent += `<p><strong>Enunciado:</strong> ${q.enunciado || q.question || q.text || ''}</p>`;
        
        if (q.alternativas || q.options) {
          htmlContent += `<div style="margin-top: 10px;"><strong>Alternativas:</strong></div>`;
          const alternativas = q.alternativas || q.options || [];
          alternativas.forEach((alt: string, j: number) => {
            const letra = String.fromCharCode(65 + j);
            htmlContent += `<div class="alternative">${letra}) ${alt}</div>`;
          });
        }
        
        if (q.respostaCorreta !== undefined || q.correctAnswer !== undefined) {
          const respostaIndex = q.respostaCorreta !== undefined ? q.respostaCorreta : q.correctAnswer;
          const respostaLetra = String.fromCharCode(65 + respostaIndex);
          htmlContent += `<p style="margin-top: 10px;"><strong>Resposta Correta:</strong> ${respostaLetra})</p>`;
        }
        
        if (q.explicacao || q.explanation) {
          htmlContent += `<div class="content-block" style="margin-top: 10px;">`;
          htmlContent += `<strong>Explicação:</strong><br>${q.explicacao || q.explanation}`;
          htmlContent += `</div>`;
        }
        
        if (q.dificuldade || q.difficulty) {
          htmlContent += `<p style="margin-top: 8px;"><strong>Nível:</strong> ${q.dificuldade || q.difficulty}</p>`;
        }
        
        htmlContent += `</div>`;
      });

      if (data.observacoes) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Observações</h3>`;
        htmlContent += `<div class="content-block">${data.observacoes}</div>`;
        htmlContent += `</div>`;
      }
    }

    // PLANO DE AULA
    if (data.visao_geral || (data.objetivos && data.metodologia && data.desenvolvimento)) {
      htmlContent += `<h2>Plano de Aula</h2>`;

      // Visão Geral
      if (data.visao_geral) {
        const vg = data.visao_geral;
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Visão Geral</h3>`;
        htmlContent += `<div class="content-block">`;
        if (vg.disciplina) htmlContent += `<p><strong>Disciplina:</strong> ${vg.disciplina}</p>`;
        if (vg.tema) htmlContent += `<p><strong>Tema:</strong> ${vg.tema}</p>`;
        if (vg.serie) htmlContent += `<p><strong>Série:</strong> ${vg.serie}</p>`;
        if (vg.tempo) htmlContent += `<p><strong>Tempo:</strong> ${vg.tempo}</p>`;
        if (vg.metodologia) htmlContent += `<p><strong>Metodologia:</strong> ${vg.metodologia}</p>`;
        if (vg.recursos && Array.isArray(vg.recursos)) {
          htmlContent += `<p><strong>Recursos:</strong> ${vg.recursos.join(', ')}</p>`;
        }
        htmlContent += `</div></div>`;
      }

      // Objetivos
      if (data.objetivos) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Objetivos de Aprendizagem</h3>`;
        if (Array.isArray(data.objetivos)) {
          data.objetivos.forEach((obj: any, i: number) => {
            htmlContent += `<div class="objective-item">`;
            htmlContent += `<strong>Objetivo ${i + 1}:</strong><br>`;
            htmlContent += `${obj.descricao || obj}<br>`;
            if (obj.habilidade_bncc) htmlContent += `<small><strong>BNCC:</strong> ${obj.habilidade_bncc}</small>`;
            htmlContent += `</div>`;
          });
        } else {
          htmlContent += `<div class="content-block">${data.objetivos}</div>`;
        }
        htmlContent += `</div>`;
      }

      // Metodologia
      if (data.metodologia) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Metodologia</h3>`;
        htmlContent += `<div class="content-block">`;
        if (typeof data.metodologia === 'object') {
          if (data.metodologia.nome) htmlContent += `<p><strong>Nome:</strong> ${data.metodologia.nome}</p>`;
          if (data.metodologia.descricao) htmlContent += `<p><strong>Descrição:</strong> ${data.metodologia.descricao}</p>`;
        } else {
          htmlContent += `<p>${data.metodologia}</p>`;
        }
        htmlContent += `</div></div>`;
      }

      // Desenvolvimento
      if (data.desenvolvimento && Array.isArray(data.desenvolvimento)) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Desenvolvimento da Aula</h3>`;
        data.desenvolvimento.forEach((etapa: any, i: number) => {
          htmlContent += `<div class="subsection">`;
          htmlContent += `<h4>Etapa ${etapa.etapa || i + 1}: ${etapa.titulo || 'Sem título'}</h4>`;
          if (etapa.descricao) htmlContent += `<p>${etapa.descricao}</p>`;
          if (etapa.tipo_interacao) htmlContent += `<p><strong>Tipo de Interação:</strong> ${etapa.tipo_interacao}</p>`;
          if (etapa.tempo_estimado) htmlContent += `<p><strong>Tempo:</strong> ${etapa.tempo_estimado}</p>`;
          if (etapa.recurso_gerado) htmlContent += `<p><strong>Recurso:</strong> ${etapa.recurso_gerado}</p>`;
          htmlContent += `</div>`;
        });
        htmlContent += `</div>`;
      }

      // Atividades
      if (data.atividades && Array.isArray(data.atividades)) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Atividades</h3>`;
        data.atividades.forEach((ativ: any, i: number) => {
          htmlContent += `<div class="subsection">`;
          htmlContent += `<h4>${ativ.nome || `Atividade ${i + 1}`}</h4>`;
          if (ativ.tipo) htmlContent += `<p><strong>Tipo:</strong> ${ativ.tipo}</p>`;
          if (ativ.descricao) htmlContent += `<p>${ativ.descricao}</p>`;
          htmlContent += `</div>`;
        });
        htmlContent += `</div>`;
      }

      // Avaliação
      if (data.avaliacao) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Avaliação</h3>`;
        htmlContent += `<div class="content-block">`;
        if (typeof data.avaliacao === 'object') {
          if (data.avaliacao.criterios) htmlContent += `<p><strong>Critérios:</strong> ${data.avaliacao.criterios}</p>`;
          if (data.avaliacao.instrumentos) htmlContent += `<p><strong>Instrumentos:</strong> ${Array.isArray(data.avaliacao.instrumentos) ? data.avaliacao.instrumentos.join(', ') : data.avaliacao.instrumentos}</p>`;
        } else {
          htmlContent += `<p>${data.avaliacao}</p>`;
        }
        htmlContent += `</div></div>`;
      }
    }

    // SEQUÊNCIA DIDÁTICA
    if (data.aulas && Array.isArray(data.aulas)) {
      htmlContent += `<h2>Sequência Didática</h2>`;

      if (data.descricaoGeral) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Descrição Geral</h3>`;
        htmlContent += `<div class="content-block">${data.descricaoGeral}</div>`;
        htmlContent += `</div>`;
      }

      if (data.competenciasBNCC) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Competências BNCC</h3>`;
        htmlContent += `<div class="content-block">${data.competenciasBNCC}</div>`;
        htmlContent += `</div>`;
      }

      if (data.objetivosGerais) {
        htmlContent += `<div class="section">`;
        htmlContent += `<h3>Objetivos Gerais</h3>`;
        htmlContent += `<div class="content-block">${data.objetivosGerais}</div>`;
        htmlContent += `</div>`;
      }

      htmlContent += `<h3>Aulas</h3>`;
      data.aulas.forEach((aula: any, i: number) => {
        htmlContent += `<div class="aula-card">`;
        htmlContent += `<div class="aula-header">Aula ${i + 1}: ${aula.titulo || aula.title || 'Sem título'}</div>`;
        
        if (aula.objetivos) {
          htmlContent += `<div class="content-block">`;
          htmlContent += `<strong>Objetivos:</strong><br>${aula.objetivos}`;
          htmlContent += `</div>`;
        }
        
        if (aula.conteudo) {
          htmlContent += `<div class="content-block">`;
          htmlContent += `<strong>Conteúdo:</strong><br>${aula.conteudo}`;
          htmlContent += `</div>`;
        }
        
        if (aula.metodologia) {
          htmlContent += `<div class="content-block">`;
          htmlContent += `<strong>Metodologia:</strong><br>${aula.metodologia}`;
          htmlContent += `</div>`;
        }
        
        if (aula.recursos) {
          htmlContent += `<div class="content-block">`;
          htmlContent += `<strong>Recursos:</strong><br>${Array.isArray(aula.recursos) ? aula.recursos.join(', ') : aula.recursos}`;
          htmlContent += `</div>`;
        }
        
        if (aula.avaliacao) {
          htmlContent += `<div class="content-block">`;
          htmlContent += `<strong>Avaliação:</strong><br>${aula.avaliacao}`;
          htmlContent += `</div>`;
        }
        
        htmlContent += `</div>`;
      });

      // Diagnósticos
      if (data.diagnosticos && Array.isArray(data.diagnosticos) && data.diagnosticos.length > 0) {
        htmlContent += `<h3>Diagnósticos</h3>`;
        data.diagnosticos.forEach((diag: any, i: number) => {
          htmlContent += `<div class="subsection">`;
          htmlContent += `<h4>${diag.titulo || `Diagnóstico ${i + 1}`}</h4>`;
          if (diag.descricao) htmlContent += `<p>${diag.descricao}</p>`;
          if (diag.instrumento) htmlContent += `<p><strong>Instrumento:</strong> ${diag.instrumento}</p>`;
          htmlContent += `</div>`;
        });
      }

      // Avaliações
      if (data.avaliacoes && Array.isArray(data.avaliacoes) && data.avaliacoes.length > 0) {
        htmlContent += `<h3>Avaliações</h3>`;
        data.avaliacoes.forEach((aval: any, i: number) => {
          htmlContent += `<div class="subsection">`;
          htmlContent += `<h4>${aval.titulo || `Avaliação ${i + 1}`}</h4>`;
          if (aval.descricao) htmlContent += `<p>${aval.descricao}</p>`;
          if (aval.criterios) htmlContent += `<p><strong>Critérios:</strong> ${aval.criterios}</p>`;
          htmlContent += `</div>`;
        });
      }
    }

    // FLASH CARDS
    if (data.cards || data.flashcards) {
      htmlContent += `<h2>Flash Cards</h2>`;
      const cards = data.cards || data.flashcards || [];
      
      cards.forEach((card: any, i: number) => {
        htmlContent += `<div class="card">`;
        htmlContent += `<h4>Card ${i + 1}</h4>`;
        htmlContent += `<div class="card-front">`;
        htmlContent += `<strong>Frente:</strong><br>${card.front || card.frente || ''}`;
        htmlContent += `</div>`;
        htmlContent += `<div class="card-back">`;
        htmlContent += `<strong>Verso:</strong><br>${card.back || card.verso || ''}`;
        htmlContent += `</div>`;
        htmlContent += `</div>`;
      });
    }

    // RODAPÉ
    htmlContent += `
      <div class="footer">
        <p>Documento gerado por School Power - Ponto School</p>
        <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    `;

    htmlContent += '</body></html>';

    // Converter HTML para Blob compatível com Word
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

    console.log('✅ Arquivo Word gerado com sucesso:', fileName);
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
