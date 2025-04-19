import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search,
  Bookmark,
  Lightbulb,
  FileText,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAIResponse } from '@/services/aiChatService';

interface AprofundarModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[]; // Added messages prop type
  sessionId?: string; // Added sessionId prop type
  setShowAprofundarModal: any; // Added setShowAprofundarModal prop type
  toast: any; // Added toast prop type
}

interface AprofundadoContent {
  contexto: string;
  termos: { termo: string, definicao: string }[];
  aplicacoes: string;
  loading: boolean;
}

type ContentType = 'main' | 'explicacao' | 'topicos' | 'exemplos' | 'erros' | 'fontes';

const AprofundarModal: React.FC<AprofundarModalProps> = ({ isOpen, onClose, messages, sessionId, setShowAprofundarModal, toast }) => {
  const [activeContent, setActiveContent] = useState<ContentType>('main');
  const [loading, setLoading] = useState(false);
  const [aprofundadoContent, setAprofundadoContent] = useState<AprofundadoContent>({
    contexto: '',
    termos: [],
    aplicacoes: '',
    loading: false
  });
  const [lastGeneratedContext, setLastGeneratedContext] = useState<string>('');

  // Obter a última mensagem do assistente (resposta da IA)
  const getLastAIMessage = () => {
    if (!messages || messages.length === 0) return '';
    
    // Filtra para obter apenas mensagens do assistente e pega a última
    const assistantMessages = messages.filter(msg => msg.sender === 'assistant' || msg.role === 'assistant');
    if (assistantMessages.length === 0) return '';
    
    const lastMessage = assistantMessages[assistantMessages.length - 1];
    return lastMessage.content || '';
  };

  // Gerar conteúdo aprofundado usando a IA
  const generateDeepContent = async () => {
    if (aprofundadoContent.loading) return;
    
    const lastAIMessage = getLastAIMessage();
    if (!lastAIMessage) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar o conteúdo para aprofundar.",
        variant: "destructive"
      });
      return;
    }

    // Imediatamente começar a mostrar o estado de carregamento
    setAprofundadoContent(prev => ({ ...prev, loading: true }));

    try {
      // Extrair o tema principal da última mensagem
      const extractThemePrompt = `Você é um especialista em análise de conteúdo. Dada a seguinte mensagem, identifique e extraia APENAS o tema principal em uma frase concisa sem introduções ou explicações adicionais:
      
"${lastAIMessage}"

Formato esperado de resposta: apenas o tema principal, sem frases introdutórias ou explicativas.`;

      // Obter o tema principal
      const extractedTheme = await generateAIResponse(extractThemePrompt, sessionId || 'aprofundar_session_theme');
      
      // Limpar qualquer texto adicional para obter apenas o tema
      const cleanTheme = extractedTheme.replace(/^[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]*|[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]*$/g, '');
      console.log("Tema extraído:", cleanTheme);

      // Prompt para o contexto aprofundado
      const contextoPrompt = `Você é um especialista acadêmico. Gere um texto detalhado e aprofundado sobre o tema "${cleanTheme || lastAIMessage}".
      
Seu texto deve incluir:
1. Contexto histórico e científico completo
2. Fundamentos teóricos e evolução dos conceitos principais
3. Marcos importantes e desenvolvimentos significativos
4. Perspectivas críticas e debates acadêmicos atuais
5. Relações com outras áreas do conhecimento

Use uma linguagem acadêmica e didática, estruturando o texto em parágrafos bem organizados. Seu texto deve ser informativo, preciso e aprofundado, mantendo um tom educativo apropriado para estudantes que desejam aprender mais sobre este tema.`;

      // Prompt para os termos técnicos
      const termosPrompt = `Você é um especialista em terminologia técnica. Sobre o tema "${cleanTheme || lastAIMessage}", identifique e explique 3-5 termos técnicos importantes.
      
Para cada termo, forneça:
1. O nome do termo
2. Uma definição clara e precisa
3. A importância deste termo no contexto do tema

Formato da resposta: Liste os termos no formato JSON como este exemplo:
[
  {
    "termo": "Nome do termo 1",
    "definicao": "Definição completa do termo 1"
  },
  {
    "termo": "Nome do termo 2",
    "definicao": "Definição completa do termo 2"
  }
]`;

      // Prompt para as aplicações expandidas
      const aplicacoesPrompt = `Você é um especialista em aplicações práticas do conhecimento. Sobre o tema "${cleanTheme || lastAIMessage}", elabore sobre as aplicações práticas e teóricas.
      
Inclua:
1. Como este conhecimento é aplicado em diferentes campos
2. Exemplos práticos e concretos do mundo real
3. Relevância para estudos futuros e pesquisas atuais
4. Conexões interdisciplinares e impactos sociais
5. Inovações recentes e tendências emergentes

Forneça uma explicação detalhada e útil para um estudante que quer entender o valor prático e a relevância contemporânea deste conhecimento.`;

      // Primeiro, vamos obter só o contexto para mostrar rapidamente
      const contextoResponse = await generateAIResponse(contextoPrompt, sessionId || 'aprofundar_session');
      
      // Armazenar o contexto gerado para uso posterior
      setLastGeneratedContext(contextoResponse);
      
      // Atualizar o estado imediatamente com o contexto, mantendo loading como true
      // para indicar que ainda estamos buscando os outros dados
      setAprofundadoContent(prev => ({
        ...prev,
        contexto: contextoResponse
      }));

      // Agora vamos buscar os outros dados em paralelo
      const [termosResponse, aplicacoesResponse] = await Promise.all([
        generateAIResponse(termosPrompt, sessionId || 'aprofundar_session'),
        generateAIResponse(aplicacoesPrompt, sessionId || 'aprofundar_session')
      ]);

      // Processa a resposta dos termos técnicos (que deve estar em formato JSON)
      let termosParsed = [];
      try {
        // Tenta extrair JSON da resposta
        const jsonMatch = termosResponse.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          termosParsed = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: cria uma estrutura básica a partir do texto
          termosParsed = [{ termo: "Termos técnicos", definicao: termosResponse }];
        }
      } catch (e) {
        console.error("Erro ao processar termos técnicos:", e);
        // Fallback em caso de erro de parsing
        termosParsed = [{ termo: "Termos técnicos", definicao: termosResponse }];
      }

      // Atualiza o estado com todo o conteúdo gerado e finaliza o carregamento
      setAprofundadoContent({
        contexto: contextoResponse,
        termos: termosParsed,
        aplicacoes: aplicacoesResponse,
        loading: false
      });

    } catch (error) {
      console.error("Erro ao gerar conteúdo aprofundado:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o conteúdo aprofundado. Tente novamente.",
        variant: "destructive"
      });
      setAprofundadoContent(prev => ({ ...prev, loading: false }));
    }
  };

  // Quando o modal abrir na seção de explicação, gerar o conteúdo
  useEffect(() => {
    if (isOpen && activeContent === 'explicacao' && 
        (!aprofundadoContent.contexto && !aprofundadoContent.loading)) {
      // Iniciar carregamento imediatamente
      generateDeepContent();
    }
  }, [isOpen, activeContent, aprofundadoContent.contexto, aprofundadoContent.loading]);

  const handleOptionClick = (option: ContentType) => {
    setLoading(true);
    // Simula um tempo de carregamento
    setTimeout(() => {
      setActiveContent(option);
      setLoading(false);
      
      // Se selecionou explicação e ainda não tem conteúdo, gera
      if (option === 'explicacao' && !aprofundadoContent.contexto && !aprofundadoContent.loading) {
        generateDeepContent();
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
            {aprofundadoContent.loading ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Gerando conteúdo aprofundado para você...
              </span>
            ) : (
              "Aqui você encontrará uma versão expandida da resposta original da IA, incluindo explicações mais detalhadas, termos técnicos, aplicações do conteúdo, contexto histórico e comparações com conceitos semelhantes."
            )}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Contexto Aprofundado</h4>
            {aprofundadoContent.loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line">
                {aprofundadoContent.contexto || lastGeneratedContext || (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Gerando contexto aprofundado...
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Termos Técnicos</h4>
            {aprofundadoContent.loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {aprofundadoContent.termos && aprofundadoContent.termos.length > 0 ? (
                  aprofundadoContent.termos.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="block font-medium text-blue-600 dark:text-blue-400 mb-1">{item.termo}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.definicao}</span>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="block font-medium text-blue-600 dark:text-blue-400 mb-1">Termos técnicos</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Os termos técnicos relacionados ao tema serão listados aqui.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Aplicações Expandidas</h4>
            {aprofundadoContent.loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line">
                {aprofundadoContent.aplicacoes || "As aplicações práticas e teóricas deste conhecimento serão listadas aqui."}
              </div>
            )}
          </div>
          
          {!aprofundadoContent.contexto && !aprofundadoContent.loading && (
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={generateDeepContent}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Gerar conteúdo aprofundado
              </Button>
            </div>
          )}
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