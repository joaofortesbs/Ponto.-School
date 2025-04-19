
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
}

type ContentType = 'main' | 'explicacao' | 'topicos' | 'exemplos' | 'erros' | 'fontes';

const AprofundarModal: React.FC<AprofundarModalProps> = ({ isOpen, onClose }) => {
  const [activeContent, setActiveContent] = useState<ContentType>('main');
  const [loading, setLoading] = useState(false);

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
    const [content, setContent] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    
    useEffect(() => {
      const generateContent = async () => {
        setIsGenerating(true);
        // Simulação de chamada de API para a IA - em um ambiente real, isso seria substituído pela chamada real
        setTimeout(() => {
          const generatedContent = `
            <div class="space-y-6">
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Contexto Histórico</h4>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Este conceito tem suas origens no século XIX quando pesquisadores começaram a explorar as teorias fundamentais que dariam base ao que conhecemos hoje. Foi apenas no início do século XX que os avanços tecnológicos permitiram uma compreensão mais profunda do tema.
                </p>
              </div>
              
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Termos Técnicos Essenciais</h4>
                <div class="grid grid-cols-1 gap-3">
                  <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span class="block font-medium text-blue-600 dark:text-blue-400 mb-1">Integridade Referencial</span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Conjunto de regras que garantem que os relacionamentos entre registros de tabelas permaneçam consistentes. Quando uma chave estrangeira existe, cada valor dessa chave deve ter um valor correspondente na tabela referenciada.</span>
                  </div>
                  <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span class="block font-medium text-blue-600 dark:text-blue-400 mb-1">Normalização</span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Processo de organização de dados em um banco de dados que inclui a criação de tabelas e o estabelecimento de relações entre essas tabelas de acordo com regras projetadas para proteger os dados e tornar o banco de dados mais flexível.</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Complexidade Conceitual</h4>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Quando analisamos a fundo, percebemos que este conceito se relaciona com diversos campos do conhecimento. Na matemática, serve como fundamento para algoritmos complexos. Na física, ajuda a explicar fenômenos naturais. Na computação, é essencial para desenvolvimento de sistemas robustos.
                </p>
              </div>
              
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Aplicações Avançadas</h4>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Além das aplicações básicas, este conhecimento é fundamental em campos emergentes como inteligência artificial, onde algoritmos sofisticados dependem destes princípios para processar grandes volumes de dados. Na indústria 4.0, sistemas automatizados utilizam estes conceitos para otimizar processos produtivos e reduzir desperdícios.
                </p>
              </div>
            </div>
          `;
          setContent(generatedContent);
          setIsGenerating(false);
        }, 1500);
      };

      generateContent();
    }, []);

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
          {isGenerating ? (
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
              
              {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
            </>
          )}
        </ScrollArea>
      </div>
    );
  };

  const renderTopicosRelacionados = () => {
    const [content, setContent] = useState<any[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    
    useEffect(() => {
      const generateContent = async () => {
        setIsGenerating(true);
        // Simulação de chamada de API para a IA
        setTimeout(() => {
          const generatedContent = [
            {
              titulo: "Normalização de Bancos de Dados",
              descricao: "Entenda como estruturar bancos de dados para maior eficiência e redução de redundâncias. Este tópico é fundamental para o desenvolvimento de sistemas escaláveis.",
            },
            {
              titulo: "Índices e Performance em SQL",
              descricao: "Aprenda como os índices afetam a performance de consultas SQL e como otimizar seu banco de dados para casos de uso específicos.",
            },
            {
              titulo: "Modelagem de Dados Relacionais",
              descricao: "Explore técnicas de modelagem de dados e como representar relacionamentos complexos entre entidades em um sistema.",
            }
          ];
          setContent(generatedContent);
          setIsGenerating(false);
        }, 1500);
      };

      generateContent();
    }, []);

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
          {isGenerating ? (
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
                {content && content.map((item, index) => (
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
    const [content, setContent] = useState<any[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    
    useEffect(() => {
      const generateContent = async () => {
        setIsGenerating(true);
        // Simulação de chamada de API para a IA
        setTimeout(() => {
          const generatedContent = [
            {
              titulo: "Aplicação em sistema de e-commerce",
              descricao: "Um e-commerce precisa armazenar dados de produtos, clientes e pedidos. Ao utilizar chaves estrangeiras adequadamente, o sistema garante que não existam pedidos para produtos que não existem no catálogo ou para clientes inexistentes na base.",
              pergunta: "Como você modificaria este modelo para suportar múltiplos endereços de entrega por cliente?"
            },
            {
              titulo: "Sistema de gestão escolar",
              descricao: "Uma escola precisa registrar alunos, professores, disciplinas e notas. Usando normalização adequada, podemos evitar redundâncias e garantir que cada aluno esteja matriculado em disciplinas válidas, com professores existentes.",
              pergunta: "Quais tabelas seriam necessárias para implementar um sistema de frequência integrado a este modelo?"
            }
          ];
          setContent(generatedContent);
          setIsGenerating(false);
        }, 1500);
      };

      generateContent();
    }, []);

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
          {isGenerating ? (
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
                {content && content.map((item, index) => (
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
    const [erros, setErros] = useState<any[] | null>(null);
    const [dicas, setDicas] = useState<any[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    
    useEffect(() => {
      const generateContent = async () => {
        setIsGenerating(true);
        // Simulação de chamada de API para a IA
        setTimeout(() => {
          const generatedErros = [
            {
              titulo: "Desconsiderar a integridade referencial",
              descricao: "Muitos estudantes ignoram a importância da integridade referencial, resultando em bancos de dados com inconsistências e dados órfãos.",
              solucao: "Sempre defina constraints de chave estrangeira e planeje cascades de atualização/exclusão adequadamente."
            },
            {
              titulo: "Normalização excessiva ou insuficiente",
              descricao: "É comum ver modelos super-normalizados (difíceis de trabalhar) ou sub-normalizados (com muita redundância).",
              solucao: "Busque um equilíbrio, normalmente até a 3ª forma normal, considerando requisitos de performance."
            },
            {
              titulo: "Ignorar os tipos de dados adequados",
              descricao: "Utilizar tipos de dados inadequados para as colunas pode causar problemas de performance e precisão.",
              solucao: "Escolha tipos apropriados para cada dado, considerando tamanho, formato e operações necessárias."
            }
          ];
          
          const generatedDicas = [
            {
              descricao: "Pratique modelagem criando diagramas ER para sistemas do cotidiano, como biblioteca, locadora ou aplicativos."
            },
            {
              descricao: "Após criar modelos, implemente-os em um SGBD real e teste seu funcionamento na prática."
            },
            {
              descricao: "Estude casos reais de bancos de dados e analise como empresas resolvem problemas complexos."
            }
          ];
          
          setErros(generatedErros);
          setDicas(generatedDicas);
          setIsGenerating(false);
        }, 1500);
      };

      generateContent();
    }, []);

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
          {isGenerating ? (
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
                  {erros && erros.map((item, index) => (
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
                  {dicas && dicas.map((item, index) => (
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
    const [recursos, setRecursos] = useState<any[] | null>(null);
    const [exercicios, setExercicios] = useState<any[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    
    useEffect(() => {
      const generateContent = async () => {
        setIsGenerating(true);
        // Simulação de chamada de API para a IA
        setTimeout(() => {
          const generatedRecursos = [
            {
              tipo: "Vídeo",
              titulo: "Curso Completo de Banco de Dados",
              descricao: "Série de vídeos explicando desde conceitos básicos até avançados de SQL e modelagem"
            },
            {
              tipo: "Livro",
              titulo: "Sistemas de Banco de Dados - Elmasri & Navathe",
              descricao: "Referência completa sobre fundamentos teóricos e práticos de bancos de dados"
            },
            {
              tipo: "Artigo",
              titulo: "Otimização de Consultas em SGBDs Relacionais",
              descricao: "Estudo detalhado sobre técnicas de otimização de performance"
            },
            {
              tipo: "Podcast",
              titulo: "SQL Show - Episódio 42: Boas Práticas",
              descricao: "Discussão sobre práticas recomendadas por especialistas da indústria"
            }
          ];
          
          const generatedExercicios = [
            {
              descricao: "Projete um banco de dados para um sistema de biblioteca universitária que precisa controlar empréstimos, reservas e multas por atraso."
            },
            {
              descricao: "Dado um modelo ER, identifique e corrija problemas de normalização até a 3ª forma normal."
            }
          ];
          
          setRecursos(generatedRecursos);
          setExercicios(generatedExercicios);
          setIsGenerating(false);
        }, 1500);
      };

      generateContent();
    }, []);

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
          {isGenerating ? (
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
                  {recursos && recursos.map((item, index) => (
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
                  {exercicios && exercicios.map((item, index) => (
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
