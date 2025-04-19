import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search,
  Bookmark,
  Lightbulb,
  FileText,
  AlertTriangle,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAIResponse } from '@/services/aiChatService';
import TypewriterEffect from '@/components/ui/typewriter-effect';

interface AprofundarModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[]; // Added messages prop type
  sessionId?: string; // Added sessionId prop type
  setShowAprofundarModal: any; // Added setShowAprofundarModal prop type
  toast: any; // Added toast prop type
}

type ContentType = 'main' | 'explicacao' | 'topicos' | 'exemplos' | 'erros' | 'fontes';

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

  // Função para gerar conteúdo aprofundado
  const generateAprofundadoContent = async () => {
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
    if (!messageContent.trim()) {
      console.log("Não foi encontrada mensagem específica da IA, buscando temas no histórico de conversas");
      
      // Extrai temas de todas as mensagens recentes (últimas 5)
      const recentMessages = messages.slice(-5);
      const allContent = recentMessages
        .map(msg => extractContent(msg))
        .filter(content => content.trim().length > 30)
        .join(". ");
      
      if (allContent) {
        messageContent = `Com base na conversa recente sobre: "${allContent.substring(0, 200)}..."`;
        console.log("Usando tema extraído do contexto da conversa");
      }
    }
    
    // Último recurso - se ainda não tem conteúdo, usa um tema genérico educacional
    const safeMessageContent = messageContent.trim() || 
      "O usuário está buscando informações mais aprofundadas sobre os assuntos educacionais recentemente discutidos. " +
      "Com base no contexto da plataforma educacional, forneça um conteúdo detalhado sobre tópicos de estudo relevantes, " +
      "incluindo conceitos fundamentais, aplicações práticas e contexto histórico.";
    
    // Define o tema atual com uma prévia do conteúdo
    setTemaAtual(safeMessageContent.substring(0, 100) + '...');
    
    console.log("Conteúdo para aprofundamento:", safeMessageContent.substring(0, 50) + "...");
    
    // Configura o estado de carregamento
    setAprofundadoContent(prev => ({...prev, loading: true}));

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
      
      Conteúdo a ser expandido:
      "${safeMessageContent}"
      
      Importante: Se o conteúdo original não tiver informações suficientes, realize uma análise profunda baseada nas indicações de tópico presentes nele.
      Caso o conteúdo seja muito genérico, escolha um tema educacional importante relacionado e o desenvolva profundamente.
      `;

      // Chame a API para gerar o contexto aprofundado
      console.log("Gerando contexto aprofundado...");
      const contextoResponse = await generateAIResponse(contextPrompt, sessionId || 'default_session');
      
      // Verifica se o conteúdo é válido e útil
      const isValidContent = contextoResponse && 
                            contextoResponse.length > 100 && 
                            !contextoResponse.includes("Não foi possível") &&
                            !contextoResponse.includes("Não tenho informações suficientes");
      
      // Se o conteúdo for válido, atualiza o estado. Caso contrário, gera um conteúdo de fallback
      if (isValidContent) {
        console.log("Contexto aprofundado gerado com sucesso!");
        setAprofundadoContent(prev => ({...prev, contexto: contextoResponse, loading: false}));
      } else {
        console.log("Gerando conteúdo de fallback devido a resposta insuficiente...");
        // Gera um conteúdo de fallback sobre um tema educacional geral
        const fallbackPrompt = `
        Crie uma explicação detalhada e aprofundada sobre um importante tópico educacional.
        Escolha um tópico que seja universalmente relevante e que tenha aspectos históricos, teóricos e práticos interessantes.
        A explicação deve incluir contexto histórico, fundamentos teóricos, aplicações práticas e relevância moderna.
        Formate o conteúdo de forma bem estruturada, com introdução clara e desenvolvimento lógico das ideias.
        `;
        
        const fallbackResponse = await generateAIResponse(fallbackPrompt, sessionId || 'default_session');
        setAprofundadoContent(prev => ({...prev, contexto: fallbackResponse, loading: false}));
      }

      // Agora faça solicitações para os termos e aplicações em segundo plano
      // Usa o conteúdo da resposta como base para os termos, garantindo consistência
      const termosPrompt = `
      Liste e explique os principais termos técnicos relacionados ao tema que você acabou de explicar. Para cada termo, forneça:
      1. Definição clara e precisa
      2. Exemplo prático ou contexto de uso
      3. Se possível, uma analogia para facilitar o entendimento

      Responda em formato que possa ser facilmente convertido para JSON com estrutura
      [{"termo": "Nome do Termo", "definicao": "Definição completa com exemplo e analogia"}, ...]
      
      Garanta que os termos sejam realmente relacionados ao conteúdo que você acabou de criar na explicação detalhada.
      `;

      const aplicacoesPrompt = `
      Mostre como o conhecimento sobre o tema que você acabou de explicar pode ser aplicado em diferentes contextos:
      1. Em debates atuais e discussões contemporâneas
      2. Em estudos interdisciplinares
      3. Para resolução de problemas práticos
      4. Em redações, artigos acadêmicos ou trabalhos escolares
      5. Relações com outros temas históricos ou científicos semelhantes
      
      Estruture sua resposta com subtítulos claros e exemplos concretos para cada aplicação.
      Garanta que as aplicações sejam realmente relacionadas ao conteúdo que você explicou anteriormente na explicação detalhada.
      `;

      // Execute estas chamadas em paralelo
      Promise.all([
        generateAIResponse(termosPrompt, sessionId || 'default_session'),
        generateAIResponse(aplicacoesPrompt, sessionId || 'default_session')
      ]).then(([termosResponse, aplicacoesResponse]) => {
        // Tenta extrair os termos no formato JSON
        let termosArray = [];
        try {
          // Procura por conteúdo que parece ser JSON
          const jsonMatch = termosResponse.match(/\[\s*{.+}\s*\]/s);
          if (jsonMatch) {
            termosArray = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: cria um termo único com a resposta completa
            termosArray = [{
              termo: "Glossário Completo",
              definicao: termosResponse
            }];
          }
        } catch (e) {
          console.error("Erro ao processar termos:", e);
          termosArray = [{
            termo: "Glossário Técnico",
            definicao: termosResponse
          }];
        }

        // Atualiza o estado com todos os dados
        setAprofundadoContent(prev => ({
          ...prev,
          termos: termosArray,
          aplicacoes: aplicacoesResponse,
          loading: false
        }));
      });
    } catch (error) {
      console.error("Erro ao gerar conteúdo aprofundado:", error);
      
      try {
        console.log("Tentando gerar conteúdo alternativo após erro...");
        // Tenta gerar um conteúdo alternativo sobre um tópico educacional geral
        const emergencyPrompt = `
        Crie uma explicação educacional detalhada sobre um tema importante para estudantes.
        Escolha um tópico fundamental que seja útil para o desenvolvimento acadêmico.
        Inclua contexto histórico, conceitos-chave, aplicações práticas e relevância atual.
        `;
        
        const emergencyResponse = await generateAIResponse(emergencyPrompt, sessionId || 'default_session');
        
        if (emergencyResponse && emergencyResponse.length > 200) {
          // Se conseguiu gerar conteúdo de emergência, usa ele
          setAprofundadoContent({
            contexto: emergencyResponse,
            loading: false,
            termos: [
              {
                termo: "Conceito Fundamental", 
                definicao: "Ideia básica essencial para a compreensão de um campo de estudo específico."
              },
              {
                termo: "Aplicação Prática", 
                definicao: "Uso de conhecimentos teóricos para resolver problemas reais ou criar soluções úteis."
              }
            ],
            aplicacoes: "Este conhecimento pode ser aplicado em diversos contextos acadêmicos, no desenvolvimento de projetos, em debates e discussões, na solução de problemas reais e na compreensão de fenômenos complexos do mundo ao nosso redor."
          });
          return;
        }
      } catch (secondError) {
        console.error("Erro também na tentativa de conteúdo alternativo:", secondError);
      }
      
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

  const renderMainContent = () => (
    <div className="space-y-3 mt-3">
      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('explicacao')}
      >
        <div className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Explicação Avançada</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Aprofunde seu conhecimento com detalhes e contexto</span>
        </div>
      </div>

      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('topicos')}
      >
        <div className="bg-purple-100 dark:bg-purple-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <Bookmark className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Tópicos Relacionados</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Explore conexões com outros conceitos relevantes</span>
        </div>
      </div>

      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-green-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('exemplos')}
      >
        <div className="bg-green-100 dark:bg-green-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Exemplos Práticos</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Veja aplicações reais e situações do dia a dia</span>
        </div>
      </div>

      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-amber-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('erros')}
      >
        <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Erros Comuns e Dicas</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Evite armadilhas e acelere seu aprendizado</span>
        </div>
      </div>

      <div 
        className="flex items-center p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-yellow-50 dark:from-gray-800 dark:to-gray-800/80 hover:shadow-md dark:hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
        onClick={() => handleOptionClick('fontes')}
      >
        <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2.5 rounded-full mr-4 group-hover:scale-110 transition-transform">
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 dark:text-gray-100 block mb-0.5">Explore Mais</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Recursos adicionais e materiais complementares</span>
        </div>
      </div>
    </div>
  );

  const renderExplicacaoAvancada = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          size="sm" 
          className="mr-2 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Explicação Avançada</h3>
      </div>

      <ScrollArea className="h-[60vh] pr-4">
        <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            O conteúdo solicitado está sendo preparado para você. Aqui você encontrará uma versão expandida da resposta original da IA, incluindo explicações mais detalhadas, termos técnicos, aplicações do conteúdo, contexto histórico e comparações com conceitos semelhantes.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Contexto Aprofundado</h4>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {aprofundadoContent.loading ? (
                <div className="typewriter-loader">Preparando conteúdo...</div>
              ) : (
                <TypewriterEffect text={aprofundadoContent.contexto} typingSpeed={1} />
              )}
            </div>
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Termos Técnicos</h4>
            <div className="grid grid-cols-1 gap-3">
              {aprofundadoContent.loading ? (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="block font-medium text-blue-600 dark:text-blue-400 mb-1">Carregando termos...</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Os termos técnicos estão sendo preparados.</span>
                </div>
              ) : (
                aprofundadoContent.termos.length > 0 ? (
                  aprofundadoContent.termos.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="block font-medium text-blue-600 dark:text-blue-400 mb-1">{item.termo}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.definicao}</span>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="block font-medium text-blue-600 dark:text-blue-400 mb-1">Termos técnicos</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Não foram encontrados termos técnicos específicos para este tema.</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Aplicações Expandidas</h4>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {aprofundadoContent.loading ? (
                <div className="typewriter-loader">Identificando aplicações...</div>
              ) : (
                aprofundadoContent.aplicacoes || "Aguardando geração de aplicações para este tema."
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  const renderTopicosRelacionados = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          size="sm" 
          className="mr-2 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tópicos Relacionados</h3>
      </div>

      <ScrollArea className="h-[60vh] pr-4">
        <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Aqui estão alguns tópicos diretamente relacionados com o tema que você está estudando. Explore-os para expandir seu conhecimento.
          </p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4">
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">Tópico Relacionado {item}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Breve explicação de como este tópico se conecta com o tema atual que você está estudando.
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs h-8">
                  Estudar esse tema agora
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderExemplosPraticos = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          size="sm" 
          className="mr-2 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exemplos Práticos</h3>
      </div>

      <ScrollArea className="h-[60vh] pr-4">
        <div className="bg-green-50/50 dark:bg-green-950/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Veja como o conteúdo se aplica em situações reais ou simuladas. Após cada exemplo, reflita sobre a aplicação prática.
          </p>
        </div>

        <div className="space-y-6">
          {[1, 2].map((item) => (
            <div key={item} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="bg-green-100 dark:bg-green-900/30 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                    <span className="text-green-600 dark:text-green-400 font-medium">{item}</span>
                  </div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">Exemplo {item}</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Aqui será apresentada uma situação real ou simulada que demonstra a aplicação prática do conteúdo.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Como você resolveria isso? Qual seria a consequência nesse caso?
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderErrosComuns = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          size="sm" 
          className="mr-2 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Erros Comuns e Dicas</h3>
      </div>

      <ScrollArea className="h-[60vh] pr-4">
        <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Conheça os erros mais comuns que os estudantes cometem ao estudar este tema e dicas práticas para melhorar seu aprendizado.
          </p>
        </div>

        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Erros Frequentes</h4>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 p-3 rounded-lg border-l-4 border border-amber-300 dark:border-amber-700">
                <h5 className="font-medium text-gray-900 dark:text-white mb-1">Erro {item}</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Descrição do erro comum e por que ele acontece.
                </p>
                <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Como evitar: <span className="font-normal text-gray-600 dark:text-gray-400">Dica sobre como evitar este erro específico.</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Dicas de Aprendizado</h4>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start">
                <div className="bg-amber-100 dark:bg-amber-900/30 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                  <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">{item}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Dica prática para memorizar, revisar ou compreender melhor este conteúdo.
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  const renderExploreFontes = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          size="sm" 
          className="mr-2 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Explore Mais</h3>
      </div>

      <ScrollArea className="h-[60vh] pr-4">
        <div className="bg-yellow-50/50 dark:bg-yellow-950/20 rounded-xl p-4 border border-yellow-100 dark:border-yellow-900/30 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Recursos adicionais para aprofundar seu conhecimento neste tema, incluindo materiais de referência e exercícios complementares.
          </p>
        </div>

        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Recursos Recomendados</h4>
          <div className="space-y-3">
            {['Vídeo', 'Livro', 'Artigo', 'Podcast'].map((tipo, index) => (
              <a 
                key={index} 
                href="#" 
                className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center group hover:border-yellow-300 dark:hover:border-yellow-700 transition-colors"
              >
                <div className="bg-yellow-100 dark:bg-yellow-900/30 w-8 h-8 rounded-full flex items-center justify-center mr-3 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/40 transition-colors">
                  <ExternalLink className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm">{tipo}: Título do recurso</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Breve descrição do conteúdo</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Exercícios Complementares</h4>
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Questão ou exercício complementar para testar seu conhecimento sobre o tema.
                </p>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-8">
                  Responder no Simulador
                </Button>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

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
        return renderExplicacaoAvancada();
      case 'topicos':
        return renderTopicosRelacionados();
      case 'exemplos':
        return renderExemplosPraticos();
      case 'erros':
        return renderErrosComuns();
      case 'fontes':
        return renderExploreFontes();
      default:
        return renderMainContent();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl border border-gray-100/80 dark:border-gray-700/80 shadow-xl rounded-2xl">
        <DialogHeader className={activeContent === 'main' ? 'mb-2' : 'mb-0'}>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {activeContent === 'main' ? 'Aprofundar no tema' : ''}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AprofundarModal;