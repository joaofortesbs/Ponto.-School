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

interface AprofundarModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[]; // Added messages prop type
  sessionId?: string; // Added sessionId prop type
  setShowAprofundarModal: any; // Added setShowAprofundarModal prop type
  toast: any; // Added toast prop type
}

type ContentType = 'main' | 'explicacao' | 'topicos' | 'exemplos' | 'erros' | 'fontes';

interface ExplicacaoAvancadaContent {
  contextoAprofundado: string;
  termosTecnicos: Array<{termo: string, definicao: string}>;
  aplicacoesExpandidas: string;
}

const AprofundarModal: React.FC<AprofundarModalProps> = ({ isOpen, onClose, messages, sessionId, setShowAprofundarModal, toast }) => {
  const [activeContent, setActiveContent] = useState<ContentType>('main');
  const [loading, setLoading] = useState(false);
  const [explicacaoContent, setExplicacaoContent] = useState<ExplicacaoAvancadaContent>({
    contextoAprofundado: '',
    termosTecnicos: [],
    aplicacoesExpandidas: ''
  });

  const handleOptionClick = async (option: ContentType) => {
    setLoading(true);
    
    if (option === 'explicacao') {
      try {
        // Obtém o último conteúdo da IA (última mensagem)
        const lastMessage = messages && messages.length > 0 
          ? messages[messages.length - 1].content 
          : 'Não foi possível identificar o tema atual.';

        // Envia o prompt para a IA
        const promptExplicacaoAvancada = `Você está ajudando um estudante a aprofundar um tema específico. Com base no conteúdo original da aula ou pergunta respondida anteriormente, forneça uma versão expandida com:

Contexto Aprofundado: traga contexto histórico, científico ou social sobre o tema.

Termos Técnicos: liste e explique os principais termos técnicos presentes no conteúdo.

Aplicações Expandidas: explique como esse conhecimento pode ser aplicado na prática ou em outras disciplinas.

Seja didático, direto e evite jargões excessivos. Se possível, use exemplos e analogias.

Conteúdo original: "${lastMessage}"

Formato da resposta (use exatamente este formato JSON):
{
  "contextoAprofundado": "texto com contexto histórico, científico ou social sobre o tema",
  "termosTecnicos": [
    {"termo": "nome do termo 1", "definicao": "definição detalhada do termo 1"},
    {"termo": "nome do termo 2", "definicao": "definição detalhada do termo 2"}
  ],
  "aplicacoesExpandidas": "texto explicando aplicações práticas deste conhecimento"
}`;

        const response = await generateAIResponse(
          promptExplicacaoAvancada,
          sessionId || 'explicacao_avancada_session',
          {
            intelligenceLevel: 'advanced',
            languageStyle: 'formal'
          }
        );

        try {
          // Tenta fazer o parse da resposta como JSON
          const parsedResponse = JSON.parse(response);
          setExplicacaoContent(parsedResponse);
        } catch (error) {
          // Fallback: tenta extrair as seções da resposta em texto
          const contextoMatch = response.match(/Contexto Aprofundado[:\s]+([\s\S]+?)(?=Termos Técnicos|Aplicações Expandidas|$)/i);
          const termosMatch = response.match(/Termos Técnicos[:\s]+([\s\S]+?)(?=Aplicações Expandidas|$)/i);
          const aplicacoesMatch = response.match(/Aplicações Expandidas[:\s]+([\s\S]+?)(?=$)/i);
          
          const contexto = contextoMatch ? contextoMatch[1].trim() : 'Não foi possível gerar o contexto.';
          const aplicacoes = aplicacoesMatch ? aplicacoesMatch[1].trim() : 'Não foi possível gerar as aplicações.';
          
          let termos: Array<{termo: string, definicao: string}> = [];
          if (termosMatch) {
            const termosText = termosMatch[1];
            const termosLines = termosText.split('\n').filter(line => line.trim());
            
            termosLines.forEach(line => {
              const termoParts = line.split(':');
              if (termoParts.length >= 2) {
                termos.push({
                  termo: termoParts[0].trim(),
                  definicao: termoParts.slice(1).join(':').trim()
                });
              }
            });
          }
          
          if (termos.length === 0) {
            termos = [{ termo: 'Nota', definicao: 'Não foi possível extrair os termos técnicos.' }];
          }
          
          setExplicacaoContent({
            contextoAprofundado: contexto,
            termosTecnicos: termos,
            aplicacoesExpandidas: aplicacoes
          });
        }
      } catch (error) {
        console.error('Erro ao gerar explicação avançada:', error);
        toast({
          title: "Erro",
          description: "Não foi possível gerar a explicação avançada.",
          variant: "destructive"
        });
        
        setExplicacaoContent({
          contextoAprofundado: 'Não foi possível gerar o contexto aprofundado.',
          termosTecnicos: [{ termo: 'Erro', definicao: 'Ocorreu um erro ao processar os termos técnicos.' }],
          aplicacoesExpandidas: 'Não foi possível gerar as aplicações expandidas.'
        });
      }
    }
    
    setActiveContent(option);
    setLoading(false);
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
        {loading ? (
          <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Gerando conteúdo aprofundado para você. Por favor, aguarde...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Contexto Aprofundado</h4>
              <div className="bg-blue-50/30 dark:bg-blue-950/10 p-4 rounded-lg border border-blue-100/60 dark:border-blue-900/20">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line">
                  {explicacaoContent.contextoAprofundado}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Termos Técnicos</h4>
              <div className="grid grid-cols-1 gap-3">
                {explicacaoContent.termosTecnicos.map((item, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="block font-medium text-blue-600 dark:text-blue-400 mb-1">{item.termo}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{item.definicao}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Aplicações Expandidas</h4>
              <div className="bg-green-50/30 dark:bg-green-950/10 p-4 rounded-lg border border-green-100/60 dark:border-green-900/20">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line">
                  {explicacaoContent.aplicacoesExpandidas}
                </p>
              </div>
            </div>
          </div>
        )}
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