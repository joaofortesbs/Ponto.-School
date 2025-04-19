import React, { useState } from 'react';
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

interface AprofundarModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[]; // Added messages prop type
  sessionId?: string; // Added sessionId prop type
  setShowAprofundarModal: any; // Added setShowAprofundarModal prop type
  toast: any; // Added toast prop type

}

type ContentType = 'main' | 'explicacao' | 'topicos' | 'exemplos' | 'erros' | 'fontes';

const AprofundarModal: React.FC<AprofundarModalProps> = ({ isOpen, onClose, messages, sessionId, setShowAprofundarModal, toast }) => {
  const [activeContent, setActiveContent] = useState<ContentType>('main');
  const [loading, setLoading] = useState(false);
  
  // Função para extrair seções da resposta da IA
  const parseAIResponse = (response: string) => {
    console.log("Resposta da IA recebida:", response.substring(0, 200) + "...");
    
    // Padrões mais rigorosos para identificar as seções específicas
    // Busca por diversos formatos possíveis de cabeçalhos de seção
    const contextoPatterns = [
      /CONTEXTO APROFUNDADO[:\s]+(.+?)(?=(?:TERMOS TÉCNICOS|TERMOS TECNICOS|Termos Técnicos|Termos|2\.|2\s+TERMOS|$))/is,
      /Contexto Aprofundado[:\s]+(.+?)(?=(?:TERMOS TÉCNICOS|TERMOS TECNICOS|Termos Técnicos|Termos|2\.|2\s+TERMOS|$))/is,
      /1\.?\s*(?:CONTEXTO|Contexto)[:\s]+(.+?)(?=(?:TERMOS TÉCNICOS|TERMOS TECNICOS|Termos Técnicos|Termos|2\.|2\s+TERMOS|$))/is,
      /Contexto[:\s]+(.+?)(?=(?:TERMOS TÉCNICOS|TERMOS TECNICOS|Termos Técnicos|Termos|2\.|2\s+TERMOS|$))/is
    ];
    
    const termosPatterns = [
      /TERMOS TÉCNICOS[:\s]+(.+?)(?=(?:APLICAÇÕES EXPANDIDAS|APLICACOES EXPANDIDAS|Aplicações|3\.|3\s+APLICAÇÕES|$))/is,
      /Termos Técnicos[:\s]+(.+?)(?=(?:APLICAÇÕES EXPANDIDAS|APLICACOES EXPANDIDAS|Aplicações|3\.|3\s+APLICAÇÕES|$))/is,
      /2\.?\s*(?:TERMOS|Termos)[:\s]+(.+?)(?=(?:APLICAÇÕES EXPANDIDAS|APLICACOES EXPANDIDAS|Aplicações|3\.|3\s+APLICAÇÕES|$))/is,
      /Termos[:\s]+(.+?)(?=(?:APLICAÇÕES EXPANDIDAS|APLICACOES EXPANDIDAS|Aplicações|3\.|3\s+APLICAÇÕES|$))/is
    ];
    
    const aplicacoesPatterns = [
      /APLICAÇÕES EXPANDIDAS[:\s]+(.+?)(?=$)/is,
      /Aplicações Expandidas[:\s]+(.+?)(?=$)/is,
      /3\.?\s*(?:APLICAÇÕES|Aplicações)[:\s]+(.+?)(?=$)/is,
      /Aplicações[:\s]+(.+?)(?=$)/is
    ];
    
    // Tenta encontrar o contexto usando vários padrões
    let contextoMatch = null;
    for (const pattern of contextoPatterns) {
      contextoMatch = response.match(pattern);
      if (contextoMatch && contextoMatch[1]) break;
    }
    
    // Tenta encontrar os termos usando vários padrões
    let termosMatch = null;
    for (const pattern of termosPatterns) {
      termosMatch = response.match(pattern);
      if (termosMatch && termosMatch[1]) break;
    }
    
    // Tenta encontrar as aplicações usando vários padrões
    let aplicacoesMatch = null;
    for (const pattern of aplicacoesPatterns) {
      aplicacoesMatch = response.match(pattern);
      if (aplicacoesMatch && aplicacoesMatch[1]) break;
    }
    
    console.log("Contexto encontrado:", contextoMatch ? "Sim" : "Não");
    console.log("Termos encontrados:", termosMatch ? "Sim" : "Não");
    console.log("Aplicações encontradas:", aplicacoesMatch ? "Sim" : "Não");
    
    // Extrair e processar termos técnicos
    const termosText = termosMatch ? termosMatch[1].trim() : "";
    let termosArray = [];
    
    // Processamento dos termos técnicos - detecção de múltiplos formatos
    if (termosText) {
      // Tenta diferentes formatos para cobrir todas as possibilidades de saída da IA
      
      // Formato com hífen: - Termo: Definição
      if (termosText.includes('- ')) {
        const termsWithDash = termosText.split(/\n- |\r\n- /).filter(t => t.trim() !== '');
        termosArray = termsWithDash.map(term => {
          const parts = term.split(/:(.*)/s);
          if (parts.length > 1) {
            return {
              termo: parts[0].trim().replace(/^- /, ''),
              definicao: parts[1].trim()
            };
          }
          return { 
            termo: term.split(' ')[0].trim(), 
            definicao: term.trim() 
          };
        });
      } 
      // Formato com números ou asteriscos: 1. Termo: / * Termo:
      else if (termosText.match(/[0-9]+\.|[*•]\s+[A-Z]/)) {
        const termsWithNumber = termosText.split(/\n[0-9]+\.|\n[*•]\s+/).filter(t => t.trim() !== '');
        termosArray = termsWithNumber.map(term => {
          const parts = term.split(/:(.*)/s);
          if (parts.length > 1) {
            return {
              termo: parts[0].trim(),
              definicao: parts[1].trim()
            };
          }
          return { 
            termo: term.split(' ')[0].trim(), 
            definicao: term.trim() 
          };
        });
      }
      // Formato com cada termo em uma nova linha sem marcadores
      else {
        const termLines = termosText.split(/\n{2,}|\n(?=[A-Z])/).filter(t => t.trim() !== '');
        termosArray = termLines.map(term => {
          const parts = term.split(/:(.*)/s);
          if (parts.length > 1) {
            return {
              termo: parts[0].trim(),
              definicao: parts[1].trim()
            };
          }
          // Se não conseguir dividir pelo ":", tenta identificar o termo e definição
          const firstSentence = term.split('.')[0].trim();
          const restText = term.substring(firstSentence.length).trim();
          return { 
            termo: firstSentence.length < 50 ? firstSentence : "Termo Técnico", 
            definicao: restText || term.trim() 
          };
        });
      }
    }
    
    // Garantir que temos pelo menos um item para exibir
    const finalTermos = termosArray.length > 0 ? termosArray : [{ 
      termo: "Termo Técnico", 
      definicao: "Para ver termos técnicos específicos deste tema, clique novamente em 'Explicação Avançada'." 
    }];
    
    // Conteúdo de fallback para garantir que sempre tem algo para mostrar
    const contextoContent = contextoMatch && contextoMatch[1].trim() 
      ? contextoMatch[1].trim() 
      : "Para ver o contexto aprofundado deste tema, clique novamente em 'Explicação Avançada'.";
      
    const aplicacoesContent = aplicacoesMatch && aplicacoesMatch[1].trim() 
      ? aplicacoesMatch[1].trim() 
      : "Para ver aplicações expandidas deste tema, clique novamente em 'Explicação Avançada'.";
    
    return {
      contexto: contextoContent,
      termos: finalTermos,
      aplicacoes: aplicacoesContent
    };
  };

  const handleOptionClick = async (option: ContentType) => {
    setLoading(true);
    
    if (option === 'explicacao') {
      try {
        // Captura o tema atual (última mensagem da conversa)
        let currentTopic = "";
        
        if (messages && messages.length > 0) {
          // Tenta obter a última resposta da IA (mais completa)
          const aiMessages = messages.filter(msg => msg.sender === 'ai' || msg.role === 'assistant');
          if (aiMessages.length > 0) {
            currentTopic = aiMessages[aiMessages.length - 1].content;
          } else {
            // Se não houver mensagens da IA, pega a última mensagem do usuário
            currentTopic = messages[messages.length - 1].content;
          }
          
          // Limita o tamanho do tema para evitar tokens excessivos
          if (currentTopic.length > 1500) {
            currentTopic = currentTopic.substring(0, 1500) + "...";
          }
        }
        
        // Verifica se temos um tema para aprofundar
        if (!currentTopic || currentTopic.trim() === "") {
          setExplainContent({
            contexto: "Não foi possível identificar um tema para aprofundar. Inicie uma conversa primeiro.",
            termos: [{ termo: "Atenção", definicao: "Converse com a IA primeiro para ter um tema para aprofundar." }],
            aplicacoes: "Após conversar sobre um tema específico, tente a explicação avançada novamente."
          });
          setActiveContent(option);
          setLoading(false);
          return;
        }
        
        console.log("Tema capturado para aprofundamento:", currentTopic.substring(0, 100) + "...");
        
        // Prompt para a IA
        const prompt = `Você é uma IA educacional especializada em aprofundar temas para estudantes. 

Analise o seguinte conteúdo e crie uma explicação aprofundada sobre ele:

"${currentTopic}"

Sua resposta DEVE conter estas três seções claramente delimitadas:

1. CONTEXTO APROFUNDADO: 
Forneça um contexto histórico, científico e social detalhado sobre o tema. Inclua desenvolvimento histórico, principais teorias, descobertas e impacto social/cultural do tema. Seja específico e informativo.

2. TERMOS TÉCNICOS:
Liste pelo menos 5 termos técnicos importantes relacionados ao tema, cada um com sua definição completa. 
Formato: 
- Termo 1: Definição detalhada...
- Termo 2: Definição detalhada...

3. APLICAÇÕES EXPANDIDAS:
Explique como esse conhecimento pode ser aplicado na prática e em diferentes campos ou disciplinas. Inclua exemplos concretos, casos de uso reais e conexões interdisciplinares.

IMPORTANTE: Certifique-se de incluir conteúdo substancial em cada seção, sendo específico e relevante ao tema principal. Use uma linguagem didática com exemplos e analogias quando possível.`;

        // Importar e usar o serviço de IA para gerar o conteúdo
        const { generateAIResponse } = await import('@/services/aiChatService');
        const response = await generateAIResponse(prompt, sessionId || 'default-session');
        
        // Processar a resposta da IA usando o parser
        const parsedContent = parseAIResponse(response);
        setExplainContent(parsedContent);
        
        // Atualizar o estado para mostrar o conteúdo
        setActiveContent(option);
        setLoading(false);
        
        // Toast de sucesso se implementado
        if (toast) {
          toast({
            title: "Conteúdo gerado com sucesso",
            description: "O aprofundamento do tema foi gerado pela IA.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Erro ao gerar explicação avançada:', error);
        setActiveContent(option);
        setLoading(false);
        
        // Toast de erro se implementado
        if (toast) {
          toast({
            title: "Erro ao gerar conteúdo",
            description: "Não foi possível gerar o aprofundamento. Tente novamente.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Para outras opções, mantém o comportamento original
      setTimeout(() => {
        setActiveContent(option);
        setLoading(false);
      }, 500);
    }
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

  const [explainContent, setExplainContent] = useState({
    contexto: "O contexto histórico e científico do tema está sendo preparado. Por favor, aguarde...",
    termos: [{ termo: "Carregando termos", definicao: "Os termos técnicos e suas definições estão sendo gerados..." }],
    aplicacoes: "As aplicações práticas e teóricas deste tema estão sendo analisadas..."
  });

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
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {explainContent.contexto}
            </p>
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Termos Técnicos</h4>
            <div className="grid grid-cols-1 gap-3">
              {explainContent.termos.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="block font-medium text-blue-600 dark:text-blue-400 mb-1">{item.termo}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.definicao}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Aplicações Expandidas</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {explainContent.aplicacoes}
            </p>
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
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-3 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 animate-spin">⚙️</span>
            </div>
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3 flex items-center justify-center">
              <span className="text-xs text-gray-600 dark:text-gray-300">Gerando conteúdo...</span>
            </div>
            <div className="h-3 w-56 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div>
            <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div>
            <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center max-w-sm">
              Analisando o tema e aprofundando o conteúdo com contexto histórico, 
              termos técnicos e aplicações práticas
            </p>
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