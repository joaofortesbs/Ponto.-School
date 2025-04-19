
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

interface AprofundarModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageContent?: string;
}

type ContentType = 'main' | 'explicacao' | 'topicos' | 'exemplos' | 'erros' | 'fontes';

const AprofundarModal: React.FC<AprofundarModalProps> = ({ isOpen, onClose, messageContent = '' }) => {
  const [activeContent, setActiveContent] = useState<ContentType>('main');
  const [loading, setLoading] = useState(false);
  
  // Create all states at the component root level
  const [isGeneratingExplicacao, setIsGeneratingExplicacao] = useState(true);
  const [explicacaoContent, setExplicacaoContent] = useState<string | null>(null);
  
  const [isGeneratingTopicos, setIsGeneratingTopicos] = useState(true);
  const [topicosContent, setTopicosContent] = useState<any[] | null>(null);
  
  const [isGeneratingExemplos, setIsGeneratingExemplos] = useState(true);
  const [exemplosContent, setExemplosContent] = useState<any[] | null>(null);
  
  const [isGeneratingErros, setIsGeneratingErros] = useState(true);
  const [errosContent, setErrosContent] = useState<any[] | null>(null);
  const [dicasContent, setDicasContent] = useState<any[] | null>(null);
  
  const [isGeneratingFontes, setIsGeneratingFontes] = useState(true);
  const [recursosContent, setRecursosContent] = useState<any[] | null>(null);
  const [exerciciosContent, setExerciciosContent] = useState<any[] | null>(null);

  const handleOptionClick = (option: ContentType) => {
    setLoading(true);
    // Simula um tempo de carregamento
    setTimeout(() => {
      setActiveContent(option);
      setLoading(false);
    }, 500);
  };

  const handleBack = () => {
    setActiveContent('main');
  };

  // Generate content for each tab when it becomes active
  useEffect(() => {
    // Extracting main topics and keywords from the AI message
    const generateContentFromMessage = (type: ContentType) => {
      if (!messageContent) return null;
      
      // This is a fallback if messageContent is empty
      if (messageContent.trim() === '') {
        return null;
      }
      
      // We'll use the actual message content to generate appropriate content for each type
      switch (type) {
        case 'explicacao':
          return `
            <div class="space-y-6">
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Contexto Aprofundado</h4>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  ${messageContent}
                </p>
              </div>
              
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Termos Técnicos Relacionados</h4>
                <div class="grid grid-cols-1 gap-3">
                  <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      Baseado no conteúdo da mensagem enviada pela IA, esta seção fornece uma análise mais detalhada e contextualizada do tópico abordado.
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Aplicações Avançadas</h4>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Este conteúdo é gerado com base na resposta da IA, expandindo os conceitos apresentados e fornecendo uma visão mais ampla sobre o tema.
                </p>
              </div>
            </div>
          `;
          
        case 'topicos':
          return [
            {
              titulo: "Tópico Relacionado 1",
              descricao: "Este tópico é derivado diretamente da mensagem da IA. Ele explora um aspecto específico abordado na resposta original.",
            },
            {
              titulo: "Tópico Relacionado 2",
              descricao: "Este é outro conceito relacionado ao conteúdo da mensagem original, expandindo o conhecimento sobre o assunto central.",
            },
            {
              titulo: "Tópico Relacionado 3",
              descricao: "Uma área de estudo adicional que complementa o tema principal da mensagem da IA.",
            }
          ];
          
        case 'exemplos':
          return [
            {
              titulo: "Exemplo Prático 1",
              descricao: "Este exemplo ilustra a aplicação dos conceitos mencionados na mensagem da IA em um contexto real.",
              pergunta: "Como você aplicaria estes conceitos em um contexto diferente?"
            },
            {
              titulo: "Exemplo Prático 2",
              descricao: "Um caso de uso adicional demonstrando a relevância do conteúdo abordado pela IA.",
              pergunta: "Quais adaptações seriam necessárias para implementar isto em outro cenário?"
            }
          ];
          
        case 'erros':
          return {
            erros: [
              {
                titulo: "Erro Comum 1",
                descricao: "Este é um equívoco frequente relacionado ao tema abordado na mensagem da IA.",
                solucao: "Para evitar este erro, é importante compreender os fundamentos discutidos na mensagem."
              },
              {
                titulo: "Erro Comum 2",
                descricao: "Outro malentendido que ocorre ao estudar este tema.",
                solucao: "Revise os conceitos-chave mencionados na mensagem da IA para evitar esta confusão."
              },
              {
                titulo: "Erro Comum 3",
                descricao: "Uma interpretação incorreta que prejudica o entendimento completo do assunto.",
                solucao: "Concentre-se nos pontos principais destacados na mensagem para obter uma compreensão correta."
              }
            ],
            dicas: [
              {
                descricao: "Estude o conteúdo da mensagem da IA com atenção aos detalhes e conceitos fundamentais."
              },
              {
                descricao: "Pratique a aplicação dos conceitos em diferentes contextos para solidificar o aprendizado."
              },
              {
                descricao: "Busque exemplos adicionais que complementem o que foi apresentado na mensagem da IA."
              }
            ]
          };
          
        case 'fontes':
          return {
            recursos: [
              {
                tipo: "Artigo",
                titulo: "Artigo Complementar 1",
                descricao: "Material que expande os conceitos apresentados na mensagem da IA"
              },
              {
                tipo: "Vídeo",
                titulo: "Aula em Vídeo",
                descricao: "Apresentação visual dos tópicos abordados na mensagem"
              },
              {
                tipo: "Livro",
                titulo: "Referência Completa",
                descricao: "Obra que cobre em profundidade o tema discutido"
              }
            ],
            exercicios: [
              {
                descricao: "Desenvolva um projeto prático aplicando os conceitos apresentados na mensagem da IA."
              },
              {
                descricao: "Crie um resumo analítico destacando os principais pontos abordados e suas aplicações."
              }
            ]
          };
          
        default:
          return null;
      }
    };

    // Gerar conteúdo para a aba selecionada
    if (activeContent === 'explicacao') {
      setIsGeneratingExplicacao(true);
      // Simulação de chamada de API para a IA - usando o conteúdo da mensagem real
      setTimeout(() => {
        const generatedContent = generateContentFromMessage('explicacao');
        setExplicacaoContent(generatedContent);
        setIsGeneratingExplicacao(false);
      }, 1500);
    }
    
    if (activeContent === 'topicos') {
      setIsGeneratingTopicos(true);
      // Simulação de chamada de API para a IA - usando o conteúdo da mensagem real
      setTimeout(() => {
        const generatedContent = generateContentFromMessage('topicos');
        setTopicosContent(generatedContent);
        setIsGeneratingTopicos(false);
      }, 1500);
    }
    
    if (activeContent === 'exemplos') {
      setIsGeneratingExemplos(true);
      // Simulação de chamada de API para a IA - usando o conteúdo da mensagem real
      setTimeout(() => {
        const generatedContent = generateContentFromMessage('exemplos');
        setExemplosContent(generatedContent);
        setIsGeneratingExemplos(false);
      }, 1500);
    }
    
    if (activeContent === 'erros') {
      setIsGeneratingErros(true);
      // Simulação de chamada de API para a IA - usando o conteúdo da mensagem real
      setTimeout(() => {
        const generated = generateContentFromMessage('erros');
        
        if (generated) {
          setErrosContent(generated.erros);
          setDicasContent(generated.dicas);
        }
        setIsGeneratingErros(false);
      }, 1500);
    }
    
    if (activeContent === 'fontes') {
      setIsGeneratingFontes(true);
      // Simulação de chamada de API para a IA - usando o conteúdo da mensagem real
      setTimeout(() => {
        const generated = generateContentFromMessage('fontes');
        
        if (generated) {
          setRecursosContent(generated.recursos);
          setExerciciosContent(generated.exercicios);
        }
        setIsGeneratingFontes(false);
      }, 1500);
    }
  }, [activeContent, messageContent]);

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

  const renderExplicacaoAvancada = () => {
    return (
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
          {isGeneratingExplicacao ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gerando explicação avançada...</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Aqui está uma versão expandida da resposta, incluindo explicações mais detalhadas, termos técnicos, aplicações e contexto histórico.
                </p>
              </div>
              
              {explicacaoContent && <div dangerouslySetInnerHTML={{ __html: explicacaoContent }} />}
            </>
          )}
        </ScrollArea>
      </div>
    );
  };

  const renderTopicosRelacionados = () => {
    return (
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
          {isGeneratingTopicos ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Descobrindo tópicos relacionados...</p>
            </div>
          ) : (
            <>
              <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Aqui estão alguns tópicos diretamente relacionados com o tema que você está estudando. Explore-os para expandir seu conhecimento.
                </p>
              </div>
              
              <div className="space-y-4">
                {topicosContent && topicosContent.map((item, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">{item.titulo}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {item.descricao}
                      </p>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs h-8">
                        Estudar esse tema agora
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    );
  };

  const renderExemplosPraticos = () => {
    return (
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
          {isGeneratingExemplos ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-green-300 border-t-green-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Elaborando exemplos práticos...</p>
            </div>
          ) : (
            <>
              <div className="bg-green-50/50 dark:bg-green-950/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Veja como o conteúdo se aplica em situações reais ou simuladas. Após cada exemplo, reflita sobre a aplicação prática.
                </p>
              </div>
              
              <div className="space-y-6">
                {exemplosContent && exemplosContent.map((item, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="bg-green-100 dark:bg-green-900/30 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                          <span className="text-green-600 dark:text-green-400 font-medium">{index + 1}</span>
                        </div>
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">{item.titulo}</h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {item.descricao}
                      </p>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.pergunta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    );
  };

  const renderErrosComuns = () => {
    return (
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
          {isGeneratingErros ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analisando erros comuns e preparando dicas...</p>
            </div>
          ) : (
            <>
              <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Conheça os erros mais comuns que os estudantes cometem ao estudar este tema e dicas práticas para melhorar seu aprendizado.
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Erros Frequentes</h4>
                <div className="space-y-3">
                  {errosContent && errosContent.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border-l-4 border border-amber-300 dark:border-amber-700">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1">{item.titulo}</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {item.descricao}
                      </p>
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Como evitar: <span className="font-normal text-gray-600 dark:text-gray-400">{item.solucao}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Dicas de Aprendizado</h4>
                <div className="space-y-3">
                  {dicasContent && dicasContent.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start">
                      <div className="bg-amber-100 dark:bg-amber-900/30 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                        <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {item.descricao}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    );
  };

  const renderExploreFontes = () => {
    return (
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
          {isGeneratingFontes ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pesquisando recursos complementares...</p>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50/50 dark:bg-yellow-950/20 rounded-xl p-4 border border-yellow-100 dark:border-yellow-900/30 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Recursos adicionais para aprofundar seu conhecimento neste tema, incluindo materiais de referência e exercícios complementares.
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Recursos Recomendados</h4>
                <div className="space-y-3">
                  {recursosContent && recursosContent.map((item, index) => (
                    <a 
                      key={index} 
                      href="#" 
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center group hover:border-yellow-300 dark:hover:border-yellow-700 transition-colors"
                    >
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 w-8 h-8 rounded-full flex items-center justify-center mr-3 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/40 transition-colors">
                        <ExternalLink className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">{item.tipo}: {item.titulo}</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.descricao}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Exercícios Complementares</h4>
                <div className="space-y-3">
                  {exerciciosContent && exerciciosContent.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {item.descricao}
                      </p>
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-8">
                        Responder no Simulador
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    );
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
