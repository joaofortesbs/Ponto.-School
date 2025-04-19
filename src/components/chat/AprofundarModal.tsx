import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { generateAIResponse } from '@/services/aiChatService';

// Importa os componentes separados
import MainContent from './aprofundar-components/MainContent';
import ExplicacaoAvancada from './aprofundar-components/ExplicacaoAvancada';
import TopicosRelacionados from './aprofundar-components/TopicosRelacionados';
import ExemplosPraticos from './aprofundar-components/ExemplosPraticos';
import ErrosComuns from './aprofundar-components/ErrosComuns';
import ExploreMais from './aprofundar-components/ExploreMais';
import GerarFluxograma from './aprofundar-components/GerarFluxograma';
import FluxogramaVisualizer from './aprofundar-components/FluxogramaVisualizer';
import FluxogramaDetailModal from './aprofundar-components/FluxogramaDetailModal';

interface AprofundarModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[]; // Added messages prop type
  sessionId?: string; // Added sessionId prop type
  setShowAprofundarModal: any; // Added setShowAprofundarModal prop type
  toast: any; // Added toast prop type
}

type ContentType = 'main' | 'explicacao' | 'topicos' | 'exemplos' | 'erros' | 'fontes' | 'fluxograma';

interface AprofundadoContent {
  contexto: string;
  loading: boolean;
  termos: Array<{termo: string, definicao: string}>;
  aplicacoes: string;
}

const AprofundarModal: React.FC<AprofundarModalProps> = ({ isOpen, onClose, messages, sessionId, setShowAprofundarModal, toast }) => {
  const [activeContent, setActiveContent] = useState<ContentType>('main');
  const [loading, setLoading] = useState(false);
  const [temaAtual, setTemaAtual] = useState<string>('');
  const [aprofundadoContent, setAprofundadoContent] = useState<AprofundadoContent>({
    contexto: '',
    loading: true,
    termos: [],
    aplicacoes: ''
  });

  // Função para encontrar a última mensagem da IA (assistente)
  const getLastAIMessage = () => {
    if (!messages || messages.length === 0) return null;

    // Primeiro tenta identificar mensagens por propriedades específicas da IA
    const aiMessages = messages.filter(msg => 
      msg.sender === 'assistant' || 
      msg.role === 'assistant' || 
      msg.type === 'assistant' ||
      // Propriedades adicionais que podem identificar mensagens da IA
      msg.isAI === true ||
      msg.from === 'ai' ||
      msg.source === 'ai' ||
      msg.agent === 'assistant'
    );

    // Se encontrou mensagens da IA pelo método acima, retorna a mais recente
    if (aiMessages.length > 0) {
      return aiMessages[aiMessages.length - 1];
    }

    // Método alternativo: busca pela estrutura de conteúdo e comprimento
    // Percorre as mensagens na ordem inversa (da mais recente para a mais antiga)
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];

      // Se a mensagem não for do usuário (human/user), pode ser da IA
      if (msg.sender !== 'user' && msg.role !== 'user' && msg.type !== 'user') {
        // Verifica propriedades de conteúdo comuns
        const hasContent = 
          (msg.content && typeof msg.content === 'string' && msg.content.length > 20) ||
          (msg.message && typeof msg.message === 'string' && msg.message.length > 20) ||
          (msg.text && typeof msg.text === 'string' && msg.text.length > 20) ||
          (msg.answer && typeof msg.answer === 'string' && msg.answer.length > 20) ||
          (msg.response && typeof msg.response === 'string' && msg.response.length > 20);

        if (hasContent) {
          console.log("Mensagem da IA encontrada por conteúdo substancial");
          return msg;
        }
      }

      // Verifica se é uma mensagem longa - provavelmente da IA
      // As mensagens dos usuários tendem a ser perguntas mais curtas
      if (i > 0) { // Garante que não estamos na primeira mensagem
        const currentMsgContent = msg.content || msg.message || msg.text || '';
        const prevMsgContent = messages[i-1].content || messages[i-1].message || messages[i-1].text || '';

        if (typeof currentMsgContent === 'string' && 
            currentMsgContent.length > 150 && 
            currentMsgContent.length > (prevMsgContent?.length || 0) * 2) {
          console.log("Mensagem da IA encontrada por comprimento de conteúdo");
          return msg;
        }
      }
    }

    // Último recurso: se houver pelo menos duas mensagens, use a última não-consecutiva
    // Isso supõe um padrão alternado onde usuário pergunta e IA responde
    if (messages.length >= 2) {
      const lastMsg = messages[messages.length - 1];
      const secondLastMsg = messages[messages.length - 2];

      // Se a última mensagem for curta e a penúltima for longa, provavelmente a penúltima é da IA
      const lastContent = lastMsg.content || lastMsg.message || lastMsg.text || '';
      const secondLastContent = secondLastMsg.content || secondLastMsg.message || secondLastMsg.text || '';

      if (typeof lastContent === 'string' && 
          typeof secondLastContent === 'string' && 
          secondLastContent.length > lastContent.length * 1.5) {
        console.log("Mensagem da IA encontrada por padrão de conversa");
        return secondLastMsg;
      }
    }

    // Fallback final: se ainda não encontrou, pega a mensagem mais longa
    if (messages.length > 0) {
      let longestMsg = messages[0];
      let maxLength = 0;

      for (const msg of messages) {
        const contentLength = (msg.content || msg.message || msg.text || '').length;
        if (contentLength > maxLength) {
          maxLength = contentLength;
          longestMsg = msg;
        }
      }

      if (maxLength > 100) {
        console.log("Usando a mensagem mais longa como fallback");
        return longestMsg;
      }
    }

    // Se chegou até aqui, não encontrou nenhuma mensagem adequada
    return null;
  };

  // Função auxiliar para integração com a API
  const aprofundarResponse = async (prompt, sessionId, options = {}) => {
    try {
      const response = await generateAIResponse(prompt, sessionId, options);
      return response;
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      throw error;
    }
  };

  // Função para gerar conteúdo aprofundado
  const generateAprofundadoContent = async () => {
    // Indica que o processo de geração começou
    setAprofundadoContent(prev => ({...prev, loading: true}));

    // Busca mensagem da IA
    const lastAIMessage = getLastAIMessage();

    // Extrai o conteúdo da mensagem ou usa um tema genérico
    const extractContent = (message) => {
      if (!message) return '';

      // Verifica todos os formatos possíveis de conteúdo de mensagem
      return message.content || 
             message.message || 
             message.text || 
             message.answer || 
             message.response || 
             (typeof message === 'string' ? message : '');
    };

    // Extrai o conteúdo da mensagem encontrada
    let messageContent = extractContent(lastAIMessage);

    // Se não encontrou mensagem ou conteúdo vazio, tenta extrair tema a partir de todas as mensagens
    if (!messageContent || !messageContent.trim()) {
      console.log("Não foi encontrada mensagem específica da IA, buscando temas no histórico de conversas");

      // Extrai temas de todas as mensagens recentes (últimas 5)
      const recentMessages = messages.slice(-5);
      const allContent = recentMessages
        .map(msg => extractContent(msg))
        .filter(content => content && content.trim().length > 30)
        .join(". ");

      if (allContent) {
        messageContent = `Com base na conversa recente sobre: "${allContent.substring(0, 200)}..."`;
        console.log("Usando tema extraído do contexto da conversa");
      }
    }

    // Último recurso - se ainda não tem conteúdo, usa um tema genérico educacional
    const safeMessageContent = messageContent && messageContent.trim() ? messageContent.trim() : 
      "O usuário está buscando informações mais aprofundadas sobre os assuntos educacionais recentemente discutidos. " +
      "Com base no contexto da plataforma educacional, forneça um conteúdo detalhado sobre tópicos de estudo relevantes, " +
      "incluindo conceitos fundamentais, aplicações práticas e contexto histórico.";

    // Define o tema atual com uma prévia do conteúdo
    setTemaAtual(safeMessageContent.substring(0, 100) + '...');

    console.log("Conteúdo para aprofundamento:", safeMessageContent.substring(0, 50) + "...");

    try {
      // Gera contexto aprofundado com instruções mais detalhadas e robustas
      const contextPrompt = `
      Você é um especialista acadêmico encarregado de expandir consideravelmente o conteúdo abaixo.

      Sua tarefa é criar uma versão muito mais elaborada, detalhada e completa do tema apresentado, incluindo:

      1. Contexto histórico detalhado e desenvolvimento ao longo do tempo
      2. Conceitos fundamentais e definições essenciais
      3. Relações de causa e efeito aprofundadas
      4. Teoria e princípios subjacentes
      5. Aplicações práticas e relevância contemporânea
      6. Controvérsias, debates e diferentes perspectivas acadêmicas
      7. Aspectos complexos e pontos de vista alternativos
      8. Conexões interdisciplinares e abordagens comparativas

      O resultado deve ser uma explicação abrangente, acadêmica, bem estruturada e significativamente mais detalhada que a original.
      Evite simplesmente reformular - busque expandir o tema com informações adicionais relevantes.

      MUITO IMPORTANTE: Considere que este conteúdo será usado em um recurso educacional chamado "Explicação Avançada" dentro da plataforma Ponto.School. 
      O usuário espera um conteúdo realmente aprofundado, com alto nível de detalhe e qualidade acadêmica.

      FORMATAÇÃO: Use formatação markdown para estruturar sua resposta. Use títulos (##), subtítulos (###), listas, **negrito** para conceitos importantes, e _itálico_ para termos técnicos.

      Conteúdo a ser expandido:
      "${safeMessageContent}"

      Importante: Se o conteúdo original não tiver informações suficientes, realize uma análise profunda baseada nas indicações de tópico presentes nele.
      Caso o conteúdo seja muito genérico, escolha um tema educacional importante relacionado e o desenvolva profundamente.

      INSTRUÇÃO FINAL CRUCIAL: Sua resposta DEVE ser completa e detalhada, com pelo menos 1000 palavras e vários subtópicos.
      `;

      // Adiciona conteúdo inicial para feedback imediato ao usuário
      setAprofundadoContent(prev => ({
        ...prev, 
        contexto: "## Preparando análise aprofundada\n\nEstamos gerando um conteúdo detalhado sobre este tema. Este processo pode levar alguns segundos para garantir uma explicação completa e rica em detalhes...",
        loading: true
      }));

      // Chame a API para gerar o contexto aprofundado
      console.log("Gerando contexto aprofundado...");

      // Usa um timeout maior para dar tempo à API de gerar respostas completas
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Tempo esgotado ao buscar conteúdo")), 25000)
      );

      // Adicionando parâmetros específicos para garantir uma resposta detalhada
      const contextoResponse = await Promise.race([
        aprofundarResponse(contextPrompt, sessionId || 'default_session', {
          intelligenceLevel: "advanced", // Força o uso do nível mais alto de inteligência
          detailedResponse: true, // Indicação explícita para resposta detalhada
          maximumLength: true // Indica que desejamos respostas mais longas
        }),
        timeoutPromise
      ]);

      // Verifica se o conteúdo é válido e útil - verificação mais robusta
      const isValidContent = contextoResponse && 
                            typeof contextoResponse === 'string' &&
                            contextoResponse.length > 150 && 
                            !contextoResponse.includes("Não foi possível") &&
                            !contextoResponse.includes("Não tenho informações suficientes") &&
                            !contextoResponse.includes("Desculpe") &&
                            !contextoResponse.includes("Erro ao processar");

      // Adiciona validação extra para garantir conteúdo de qualidade
      const hasDetailedContent = contextoResponse && 
                               (contextoResponse.includes("##") || // Tem título markdown
                                contextoResponse.includes("\n-") || // Tem lista
                                contextoResponse.includes("**") || // Tem negrito
                                contextoResponse.length > 500); // É suficientemente longo

      // Se o conteúdo for válido, atualiza o estado
      if (isValidContent && hasDetailedContent) {
        console.log("Contexto aprofundado gerado com sucesso!");

        // Pré-processamento do conteúdo para garantir formatação adequada
        let formattedContent = contextoResponse;

        // Garante que comece com um título se não tiver
        if (!formattedContent.trim().startsWith('#')) {
          const titleText = safeMessageContent.substring(0, 40).trim() + '...';
          formattedContent = `## Análise Aprofundada: ${titleText}\n\n${formattedContent}`;
        }

        // Adiciona seções se o conteúdo for muito simples
        if (!formattedContent.includes('###') && formattedContent.length > 300) {
          formattedContent += `\n\n### Aplicações Práticas\n\nEste conceito tem diversas aplicações no contexto educacional e profissional...`;
        }

        // Atualiza imediatamente o contexto para mostrar ao usuário
        setAprofundadoContent(prev => ({...prev, contexto: formattedContent, loading: false}));

        // Agora gera os termos e aplicações em segundo plano
        try {
          // Usa o conteúdo da resposta como base para os termos, garantindo consistência
          const termosPrompt = `
          Liste e explique os 5 principais termos técnicos relacionados ao seguinte tema que você acabou de explicar: 

          "${safeMessageContent}"

          Para cada termo, forneça:
          1. Definição clara e precisa
          2. Exemplo prático ou contexto de uso
          3. Se possível, uma analogia para facilitar o entendimento

          IMPORTANTE: Responda APENAS em formato JSON válido com a estrutura:
          [{"termo": "Nome do Termo", "definicao": "Definição completa com exemplo e analogia"}, ...] 

          Não inclua nenhum texto introdutório ou comentário antes ou depois do JSON.
          `;

          const aplicacoesPrompt = `
          Mostre como o conhecimento sobre o tema "${safeMessageContent}" pode ser aplicado em diferentes contextos:

          1. Em debates atuais e discussões contemporâneas
          2. Em estudos interdisciplinares
          3. Para resolução de problemas práticos
          4. Em redações, artigos acadêmicos ou trabalhos escolares
          5. Relações com outros temas históricos ou científicos semelhantes

          Estruture sua resposta com subtítulos claros (usando formato markdown ##) e exemplos concretos para cada aplicação.
          `;

          // Execute estas chamadas em paralelo
          Promise.all([
            aprofundarResponse(termosPrompt, sessionId || 'default_session'),
            aprofundarResponse(aplicacoesPrompt, sessionId || 'default_session')
          ]).then(([termosResponse, aplicacoesResponse]) => {
            console.log("Respostas complementares recebidas!");

            // Tenta extrair os termos no formato JSON
            let termosArray = [];
            try {
              // Limpa a resposta para tentar extrair apenas o JSON
              const cleanedResponse = termosResponse.trim()
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

              // Tenta fazer parse do JSON
              termosArray = JSON.parse(cleanedResponse);

              // Garante que temos pelo menos 3 termos
              if (!Array.isArray(termosArray) || termosArray.length < 3) {
                throw new Error("JSON inválido ou com poucos termos");
              }
            } catch (e) {
              console.warn("Erro ao processar JSON de termos:", e);

              // Tenta extrair usando regex como fallback
              try {
                const jsonMatch = termosResponse.match(/\[\s*{.+}\s*\]/s);
                if (jsonMatch) {
                  termosArray = JSON.parse(jsonMatch[0]);
                }
              } catch (regexError) {
                console.error("Também falhou com regex:", regexError);
              }

              // Se ainda falhou, cria um termo único com a resposta completa
              if (!Array.isArray(termosArray) || termosArray.length === 0) {
                console.log("Criando termos manualmente a partir do texto");

                // Extrai possíveis termos do texto
                const lines = termosResponse.split('\n');
                const extractedTerms = [];

                let currentTerm = null;
                let currentDefinition = "";

                for (const line of lines) {
                  // Busca por padrões que pareçam termos
                  if (line.match(/^[0-9]+\.\s*["']?([^"':]+)["']?[:]/)) {
                    // Se já temos um termo sendo processado, salvamos
                    if (currentTerm) {
                      extractedTerms.push({
                        termo: currentTerm,
                        definicao: currentDefinition.trim()
                      });
                    }

                    // Extrai o novo termo
                    const matches = line.match(/^[0-9]+\.\s*["']?([^"':]+)["']?[:](.*)$/);
                    currentTerm = matches[1].trim();
                    currentDefinition = matches[2] ? matches[2].trim() : "";
                  } else if (currentTerm) {
                    // Continua acumulando a definição
                    currentDefinition += " " + line.trim();
                  }
                }

                // Adiciona o último termo
                if (currentTerm) {
                  extractedTerms.push({
                    termo: currentTerm,
                    definicao: currentDefinition.trim()
                  });
                }

                // Se conseguimos extrair termos, usamos eles
                if (extractedTerms.length > 0) {
                  termosArray = extractedTerms;
                } else {
                  // Último recurso: divide o texto em parágrafos
                  termosArray = [{
                    termo: "Glossário Completo",
                    definicao: termosResponse
                  }];
                }
              }
            }

            // Atualiza o estado com todos os dados complementares
            setAprofundadoContent(prev => ({
              ...prev,
              termos: termosArray,
              aplicacoes: aplicacoesResponse,
              loading: false
            }));
          }).catch(complementError => {
            console.error("Erro ao gerar conteúdo complementar:", complementError);
            // Mesmo se falhar, já temos o contexto principal
          });

        } catch (complementError) {
          console.error("Erro ao iniciar geração de conteúdo complementar:", complementError);
          // Não afeta o contexto principal que já foi carregado
        }

      } else {
        console.log("Gerando conteúdo de fallback devido a resposta insuficiente...");

        // Atualiza o estado para indicar que estamos tentando um plano alternativo
        setAprofundadoContent(prev => ({
          ...prev, 
          contexto: "## Aprofundando o tema\n\nEstamos preparando uma análise detalhada. Aguarde um momento enquanto elaboramos um conteúdo abrangente sobre este assunto...",
          loading: true
        }));

        try {
          // Gera um conteúdo de fallback sobre um tema educacional mais específico com instruções mais específicas
          const fallbackPrompt = `
          Você é um professor especialista encarregado de criar uma explicação EXTREMAMENTE DETALHADA e APROFUNDADA sobre o seguinte tema:
          "${safeMessageContent}".

          Sua explicação DEVE incluir:
          - Contexto histórico e evolução detalhada do tema ao longo do tempo
          - Fundamentos teóricos e conceitos-chave explicados com profundidade
          - Diversas aplicações práticas no mundo contemporâneo com exemplos concretos
          - Relevância para o desenvolvimento acadêmico e profissional
          - Debates e controvérsias atuais relacionados ao tema
          - Conexões com outros campos do conhecimento

          FORMATAÇÃO: Use OBRIGATORIAMENTE formatação markdown rica com:
          - Títulos (##) e subtítulos (###)
          - Listas com marcadores
          - **Negrito** para conceitos importantes
          - _Itálico_ para termos técnicos

          IMPORTANTE: Este conteúdo será usado para uma "Explicação Avançada" dentro da plataforma educacional Ponto.School.
          Seu texto DEVE ser extenso, detalhado e academicamente rigoroso, com no mínimo 1000 palavras.

          Comece com um título principal atrativo e estruture seu texto em pelo menos 5 seções distintas.
          Se o tema for genérico, identifique aspectos específicos relevantes e desenvolva-os profundamente.
          `;

          // Usa uma abordagem mais agressiva de obtenção de resposta
          const fallbackPromises = [
            aprofundarResponse(fallbackPrompt, sessionId || 'default_session', {
              intelligenceLevel: "advanced",
              detailedResponse: true,
              maximumLength: true
            }),
            // Tenta um segundo prompt ligeiramente diferente em paralelo
            aprofundarResponse(`Crie uma análise acadêmica detalhada sobre: "${safeMessageContent}"`, 
              sessionId || 'second_attempt_session', {
              intelligenceLevel: "advanced"
            })
          ];

          // Race para pegar a primeira resposta válida
          const responses = await Promise.allSettled(fallbackPromises);

          // Procura a melhor resposta entre as tentativas
          let bestResponse = null;
          for (const result of responses) {
            if (result.status === 'fulfilled' && 
                result.value && 
                typeof result.value === 'string' && 
                result.value.length > 500) {
              bestResponse = result.value;
              break;
            }
          }

          if (bestResponse) {
            console.log("Obteve conteúdo alternativo válido!");

            // Garante que o conteúdo começa com um título
            if (!bestResponse.trim().startsWith('#')) {
              bestResponse = `## Análise Aprofundada: ${safeMessageContent.substring(0, 40).trim()}...\n\n${bestResponse}`;
            }

            // Atualiza com o conteúdo alternativo de alta qualidade
            setAprofundadoContent(prev => ({
              ...prev, 
              contexto: bestResponse, 
              loading: false,
              termos: [
                {
                  termo: "Conceito Fundamental", 
                  definicao: "Ideia básica essencial para a compreensão deste campo de estudo. Serve como alicerce para o desenvolvimento de teorias e aplicações mais complexas."
                },
                {
                  termo: "Aplicação Prática", 
                  definicao: "Uso de conhecimentos teóricos para resolver problemas reais ou criar soluções úteis. Demonstra a relevância do conhecimento no contexto cotidiano."
                },
                {
                  termo: "Perspectiva Histórica", 
                  definicao: "Análise da evolução de ideias e conceitos ao longo do tempo, permitindo compreender a origem e o desenvolvimento do conhecimento atual."
                },
                {
                  termo: "Interdisciplinaridade", 
                  definicao: "Conexão entre diferentes áreas do conhecimento que se complementam na compreensão aprofundada deste tema. Esta abordagem permite uma visão mais holística e completa."
                },
                {
                  termo: "Metodologia de Análise", 
                  definicao: "Conjunto de técnicas e procedimentos utilizados para investigar e compreender este tema de forma sistemática e rigorosa."
                }
              ],
              aplicacoes: "## Aplicações deste Conhecimento\n\n" +
                          "### Em Contextos Educacionais\n" +
                          "Este tema é fundamental para o desenvolvimento de estratégias pedagógicas eficazes e para a compreensão dos processos de aprendizagem em diferentes contextos.\n\n" +
                          "### Em Debates Contemporâneos\n" +
                          "Os conceitos aqui explorados fornecem bases sólidas para discussões atuais sobre educação, ciência, tecnologia e sociedade.\n\n" +
                          "### Na Resolução de Problemas Complexos\n" +
                          "A compreensão aprofundada deste tema permite abordar desafios multifacetados com estratégias mais eficientes e fundamentadas.\n\n" +
                          "### Em Trabalhos Acadêmicos\n" +
                          "Ao incorporar este conhecimento em pesquisas e artigos, é possível desenvolver argumentações mais robustas e análises mais precisas.\n\n" +
                          "### No Desenvolvimento Profissional\n" +
                          "Profissionais que dominam estes conceitos estão melhor preparados para inovar e liderar em seus campos de atuação."
            }));
          } else {
            throw new Error("Nenhuma resposta de fallback foi satisfatória");
          }
        } catch (fallbackError) {
          console.error("Erro também no conteúdo de fallback:", fallbackError);

          // Conteúdo de emergência melhorado e contextualizado com o tema
          // Extrai palavras-chave do tema para personalizar o conteúdo de emergência
          const keywords = safeMessageContent.split(' ')
            .filter(word => word.length > 4 && !['sobre', 'como', 'para', 'quando', 'onde', 'quem', 'qual'].includes(word.toLowerCase()))
            .slice(0, 3);

          // Tenta criar um título temático baseado no conteúdo original
          let topicTitle = "Explorando o Conhecimento Aprofundado";
          if (keywords.length > 0) {
            topicTitle = `Análise Aprofundada: ${keywords.join(' ')}`;
          }

          const emergencyContent = {
            contexto: `# ${topicTitle}\n\n` +
                     `A análise aprofundada de temas relacionados a ${keywords.join(', ') || 'este assunto'} representa uma jornada fundamental no processo educacional. ` +
                     "Quando exploramos um tema além de sua superfície, descobrimos conexões, nuances e aplicações que transformam nossa compreensão.\n\n" +
                     "## Componentes do Aprendizado Profundo\n\n" +
                     "O estudo aprofundado envolve diversos elementos essenciais:\n\n" +
                     "1. **Contexto histórico** - Entender como as ideias evoluíram ao longo do tempo\n" +
                     "2. **Fundamentos teóricos** - Dominar os princípios que sustentam o conhecimento\n" +
                     "3. **Aplicações práticas** - Visualizar como o conhecimento se traduz em soluções reais\n" +
                     "4. **Conexões interdisciplinares** - Perceber como diferentes áreas se relacionam\n\n" +
                     "Ao desenvolver uma compreensão mais profunda, você adquire não apenas informações, mas sabedoria aplicável em múltiplos contextos.\n\n" +

                     "## Perspectivas Históricas\n\n" +
                     `A evolução histórica de conceitos relacionados a ${keywords[0] || 'este campo'} nos mostra como o conhecimento se transforma e se adapta através dos tempos. ` +
                     "Compreender esta trajetória nos permite apreciar não apenas o estado atual do conhecimento, mas também vislumbrar suas tendências futuras.\n\n" +

                     "## Abordagens Teóricas\n\n" +
                     "Diversas escolas de pensamento têm contribuído com suas perspectivas únicas sobre este tema. Entre as abordagens mais significativas, podemos destacar:\n\n" +
                     "- **Perspectiva estruturalista** - Analisa o tema a partir de suas estruturas fundamentais e relações internas\n" +
                     "- **Abordagem funcionalista** - Foca nas funções e propósitos dentro de um sistema maior\n" +
                     "- **Visão construtivista** - Considera como o conhecimento é construído através da experiência e interação\n\n" +

                     "## Aplicações no Mundo Real\n\n" +
                     "O conhecimento teórico ganha vida quando aplicado em contextos práticos. Algumas das aplicações mais inovadoras incluem:\n\n" +
                     "1. Desenvolvimento de metodologias educacionais adaptativas\n" +
                     "2. Criação de sistemas de análise e resolução de problemas complexos\n" +
                     "3. Elaboração de estruturas conceituais para compreensão de fenômenos multifacetados\n\n" +

                     "## Desafios e Fronteiras do Conhecimento\n\n" +
                     "Como em qualquer área do saber, existem desafios significativos e fronteiras ainda inexploradas. Alguns dos principais desafios incluem:\n\n" +
                     "- Integração de perspectivas divergentes\n" +
                     "- Adaptação a contextos culturais diversos\n" +
                     "- Desenvolvimento de ferramentas de análise mais precisas\n" +
                     "- Comunicação eficaz de conceitos complexos\n\n" +

                     "## Conclusão\n\n" +
                     `O estudo aprofundado de ${keywords.join(' ') || 'temas educacionais'} não é apenas um exercício acadêmico, mas uma poderosa ferramenta para transformação pessoal e social. ` +
                     "Ao dominar estes conhecimentos, abrimos portas para novos horizontes de compreensão e atuação no mundo.",
            loading: false,
            termos: [
              {
                termo: "Análise Aprofundada", 
                definicao: "Uma investigação detalhada que vai além da superfície para examinar os componentes e relações subjacentes de um tópico. Por exemplo, ao estudar literatura, não apenas entender o enredo, mas também analisar contexto histórico, simbolismo e influências. É como observar um iceberg em sua totalidade, não apenas a parte visível acima da água."
              },
              {
                termo: "Contexto Histórico", 
                definicao: "O conjunto de circunstâncias e eventos do passado que influenciaram o desenvolvimento de um conceito, teoria ou fenômeno. Funciona como as raízes de uma árvore, invisíveis mas fundamentais para sustentar e nutrir o conhecimento que vemos hoje."
              },
              {
                termo: "Interdisciplinaridade", 
                definicao: "Abordagem que integra conhecimentos, métodos e perspectivas de diferentes disciplinas para criar uma compreensão mais completa de um tema. Semelhante a observar um diamante sob diferentes ângulos de luz para apreciar completamente seu brilho e complexidade."
              },
              {
                termo: "Metacognição", 
                definicao: "Consciência e compreensão dos próprios processos de pensamento e aprendizagem. É como ter uma 'visão aérea' do próprio pensamento, permitindo monitorar, avaliar e ajustar estratégias de aprendizagem para maior eficácia."
              },
              {
                termo: "Pensamento Crítico", 
                definicao: "Habilidade de analisar e avaliar objetivamente informações e argumentos, identificando vieses, pressupostos e implicações. Funciona como um filtro mental que processa ideias, separando fatos de opiniões e verificando a solidez de conclusões."
              }
            ],
            aplicacoes: "## Aplicações do Conhecimento Aprofundado\n\n" +
                        "### Em Debates e Discussões Acadêmicas\n" +
                        "O domínio profundo de um tema permite argumentações mais sólidas e nuançadas, elevando o nível do discurso público e acadêmico. Permite identificar falácias, reconhecer premissas implícitas e construir argumentos mais robustos.\n\n" +

                        "### Em Estudos Interdisciplinares\n" +
                        "Conexões significativas entre diferentes áreas do conhecimento surgem quando temos compreensão aprofundada, gerando inovações importantes. A interdisciplinaridade permite uma visão mais holística e criativa dos fenômenos estudados.\n\n" +

                        "### Na Resolução de Problemas Complexos\n" +
                        "Problemas complexos exigem entendimento profundo para serem solucionados efetivamente, possibilitando abordagens mais criativas e eficazes. A capacidade de analisar um problema sob múltiplas perspectivas permite identificar soluções inovadoras.\n\n" +

                        "### Em Trabalhos Acadêmicos e Pesquisas\n" +
                        "Pesquisas, artigos e teses ganham substância e originalidade quando baseados em conhecimento detalhado e bem fundamentado. A profundidade de análise permite identificar lacunas na literatura existente e contribuir com avanços significativos.\n\n" +

                        "### No Desenvolvimento Profissional\n" +
                        "Profissionais que dominam conhecimentos aprofundados em suas áreas são capazes de tomar decisões mais informadas e implementar soluções mais eficazes. Este tipo de conhecimento é altamente valorizado em ambientes profissionais competitivos.\n\n" +

                        "### Na Formação Educacional\n" +
                        "Estudantes que desenvolvem o hábito de aprofundar seus conhecimentos constroem bases mais sólidas para aprendizados futuros e desenvolvem autonomia intelectual. Esta abordagem promove um aprendizado mais significativo e duradouro."
          };

          setAprofundadoContent(emergencyContent);
        }
      }
    } catch (error) {
      console.error("Erro ao gerar conteúdo aprofundado:", error);

      // Notifica o usuário
      toast({
        title: "Dificuldade ao gerar conteúdo",
        description: "Estamos encontrando um problema técnico. Por favor, tente novamente.",
        variant: "destructive",
        duration: 3000
      });

      // Conteúdo de fallback final em caso de todos os erros - garante que sempre haja algo útil
      const fallbackContent = {
        contexto: "# Explorando o Conhecimento Aprofundado\n\n" +
                 "A busca pelo conhecimento aprofundado é uma jornada fundamental no processo educacional. " +
                 "Quando exploramos um tema além de sua superfície, descobrimos conexões, nuances e aplicações que transformam nossa compreensão.\n\n" +
                 "## Componentes do Aprendizado Profundo\n\n" +
                 "O estudo aprofundado envolve diversos elementos essenciais:\n\n" +
                 "1. **Contexto histórico** - Entender como as ideias evoluíram ao longo do tempo\n" +
                 "2. **Fundamentos teóricos** - Dominar os princípios que sustentam o conhecimento\n" +
                 "3. **Aplicações práticas** - Visualizar como o conhecimento se traduz em soluções reais\n" +
                 "4. **Conexões interdisciplinares** - Perceber como diferentes áreas se relacionam\n\n" +
                 "Ao desenvolver uma compreensão mais profunda, você adquire não apenas informações, mas sabedoria aplicável em múltiplos contextos.",
        loading: false,
        termos: [
          {
            termo: "Análise Aprofundada", 
            definicao: "Uma investigação detalhada que vai além da superfície para examinar os componentes e relações subjacentes de um tópico. Por exemplo, ao estudar literatura, não apenas entender o enredo, mas também analisar contexto histórico, simbolismo e influências. É como observar um iceberg em sua totalidade, não apenas a parte visível acima da água."
          },
          {
            termo: "Contexto Histórico", 
            definicao: "O conjunto de circunstâncias e eventos do passado que influenciaram o desenvolvimento de um conceito, teoria ou fenômeno. Funciona como as raízes de uma árvore, invisíveis mas fundamentais para sustentar e nutrir o conhecimento que vemos hoje."
          },
          {
            termo: "Interdisciplinaridade", 
            definicao: "Abordagem que integra conhecimentos, métodos e perspectivas de diferentes disciplinas para criar uma compreensão mais completa de um tema. Semelhante a observar um diamante sob diferentes ângulos de luz para apreciar completamente seu brilho e complexidade."
          }
        ],
        aplicacoes: "## Aplicações do Conhecimento Aprofundado\n\n" +
                    "### Em Debates e Discussões\n" +
                    "O domínio profundo de um tema permite argumentações mais sólidas e nuançadas, elevando o nível do discurso público e acadêmico.\n\n" +
                    "### Em Estudos Interdisciplinares\n" +
                    "Conexões significativas entre diferentes áreas do conhecimento surgem quando temos compreensão aprofundada, gerando inovações importantes.\n\n" +
                    "### Na Resolução de Problemas\n" +
                    "Problemas complexos exigem entendimento profundo para serem solucionados efetivamente, possibilitando abordagens mais criativas e eficazes.\n\n" +
                    "### Em Trabalhos Acadêmicos\n" +
                    "Pesquisas, artigos e teses ganham substância e originalidade quando baseados em conhecimento detalhado e bem fundamentado."
      };

      setAprofundadoContent(fallbackContent);
    }
  };

  // Garante que sempre tenha conteúdo para mostrar ao usuário
  const ensureContent = () => {
    // Se não existir conteúdo ou tiver erro, tenta gerar novamente
    if (isOpen && activeContent === 'explicacao' && 
       (aprofundadoContent.contexto === '' || 
        aprofundadoContent.contexto.includes("Não foi possível encontrar"))) {
      console.log("Iniciando geração proativa de conteúdo");
      generateAprofundadoContent();
    }
  };

  // Quando o modal abrir na seção de explicação, gerar o conteúdo
  useEffect(() => {
    if (isOpen && activeContent === 'explicacao') {
      // Pequeno timeout para garantir que states foram atualizados
      setTimeout(() => {
        ensureContent();
      }, 100);
    }
  }, [isOpen, activeContent]);

  // Verifica o conteúdo sempre que houver mudança de active content
  useEffect(() => {
    if (activeContent === 'explicacao') {
      ensureContent();
    }
  }, [activeContent]);

  const handleOptionClick = (option: ContentType) => {
    setLoading(true);
    // Simula um tempo de carregamento
    setTimeout(() => {
      setActiveContent(option);
      setLoading(false);

      // Se a opção escolhida for 'explicacao' e ainda não temos conteúdo, geramos
      if (option === 'explicacao' && aprofundadoContent.contexto === '') {
        generateAprofundadoContent();
      }
    }, 500);
  };

  const handleBack = () => {
    setActiveContent('main');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-60">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-3"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      );
    }

    switch (activeContent) {
      case 'explicacao':
        return <ExplicacaoAvancada 
                 handleBack={handleBack} 
                 aprofundadoContent={aprofundadoContent} 
                 generateAprofundadoContent={generateAprofundadoContent} />;
      case 'topicos':
        return <TopicosRelacionados handleBack={handleBack} />;
      case 'exemplos':
        return <ExemplosPraticos handleBack={handleBack} />;
      case 'erros':
        return <ErrosComuns handleBack={handleBack} />;
      case 'fontes':
        return <ExploreMais handleBack={handleBack} />;
      case 'fluxograma':
        return <GerarFluxograma 
                 handleBack={handleBack}
                 aprofundadoContent={aprofundadoContent} />;
      default:
        return <MainContent handleOptionClick={handleOptionClick} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] w-[95vw] p-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="flex flex-col h-[80vh]">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AprofundarModal;