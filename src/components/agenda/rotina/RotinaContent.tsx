import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
  Brain,
  Plus,
  FileEdit,
  CheckCircle2,
  CalendarRange,
  ListTodo,
  RefreshCw,
  ChevronRight,
  X,
} from "lucide-react";

const RotinaContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [routineDescription, setRoutineDescription] = useState("");
  const [goalsDescription, setGoalsDescription] = useState("");
  const [obrigatoriaEvents, setObrigatoriaEvents] = useState([]);
  const [variavelEvents, setVariavelEvents] = useState([]);
  const [consideracoesMessages, setConsideracoesMessages] = useState([
    { id: 1, content: "Olá! Compartilhe suas considerações para a sua rotina ideal, e eu ajudarei a otimizá-la.", sender: "ai" }
  ]);
  const [consideracoesInput, setConsideracoesInput] = useState("");
  const consideracoesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Função para rolar para o final do chat
  const scrollToBottom = () => {
    consideracoesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Rolar para o final quando novas mensagens forem adicionadas
  useEffect(() => {
    scrollToBottom();
  }, [consideracoesMessages]);

  const addObrigatoriaEvent = (event: string) => {
    setObrigatoriaEvents([...obrigatoriaEvents, { id: Date.now(), event }]);
  };

  const removeObrigatoriaEvent = (id: number) => {
    setObrigatoriaEvents(obrigatoriaEvents.filter((event) => event.id !== id));
  };

  const addVariavelEvent = (event: string) => {
    setVariavelEvents([...variavelEvents, { id: Date.now(), event }]);
  };

  const removeVariavelEvent = (id: number) => {
    setVariavelEvents(variavelEvents.filter((event) => event.id !== id));
  };

  const handleSendConsideracoes = async () => {
    if (consideracoesInput.trim() === "" || isLoading) return;

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now(),
      content: consideracoesInput,
      sender: "user"
    };
    setConsideracoesMessages(prev => [...prev, userMessage]);
    setConsideracoesInput("");
    setIsLoading(true);

    // Simular resposta da IA após delay (você pode integrar com seu serviço de IA real depois)
    setTimeout(() => {
      const aiMessage = {
        id: Date.now(),
        content: `Entendi sua consideração sobre "${consideracoesInput.substring(0, 30)}...". Vou levar isso em conta ao otimizar sua rotina.`,
        sender: "ai"
      };
      setConsideracoesMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };


  return (
    <div className="p-6 text-white">
      <div className="mb-8 text-center">
        <p className="text-gray-300 text-sm max-w-lg mx-auto">
          Crie, personalize e otimize sua rotina de estudos e atividades com a ajuda de inteligência artificial.
        </p>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <TabsList className="bg-[#29335C]/30 p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm rounded-lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Rotina
            </TabsTrigger>
            <TabsTrigger
              value="optimize"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm rounded-lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Otimizar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="outline-none">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Sua Rotina Inteligente</h3>
            <p className="text-center text-gray-400 max-w-md">
              Crie uma rotina otimizada que se adapta às suas necessidades e objetivos de aprendizagem.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white rounded-lg h-12 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                onClick={() => setActiveTab("create")}
              >
                <Plus className="h-4 w-4" />
                Criar Nova Rotina
              </Button>
              <Button
                variant="outline"
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg h-12 flex items-center justify-center gap-2"
              >
                <FileEdit className="h-4 w-4" />
                Ver Rotinas Anteriores
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create" className="outline-none space-y-8">
          <div className="bg-[#29335C]/20 p-6 rounded-xl border border-[#29335C]/30">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#FF6B00]" />
              Criar Nova Rotina
            </h3>
            <p className="text-gray-400 mb-6">
              Defina seus objetivos e preferências para que possamos criar uma rotina personalizada para você.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  className="bg-[#29335C]/40 hover:bg-[#29335C]/60 text-white p-4 h-auto rounded-lg flex items-start justify-start gap-3 transition-colors text-left"
                  variant="ghost"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center shrink-0">
                    <Brain className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Assistente IA</h4>
                    <p className="text-xs text-gray-400">
                      Deixe nossa IA criar uma rotina baseada nas suas necessidades
                    </p>
                  </div>
                </Button>

                <Button
                  className="bg-[#29335C]/40 hover:bg-[#29335C]/60 text-white p-4 h-auto rounded-lg flex items-start justify-start gap-3 transition-colors text-left"
                  variant="ghost"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center shrink-0">
                    <FileEdit className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Personalizada</h4>
                    <p className="text-xs text-gray-400">
                      Monte sua rotina do zero com todas as opções de personalização
                    </p>
                  </div>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <Button
                  className="bg-[#29335C]/40 hover:bg-[#29335C]/60 text-white p-4 h-auto rounded-lg flex items-start justify-start gap-3 transition-colors text-left"
                  variant="ghost"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Para Concursos</h4>
                    <p className="text-xs text-gray-400">Foco em preparação para concursos</p>
                  </div>
                </Button>

                <Button
                  className="bg-[#29335C]/40 hover:bg-[#29335C]/60 text-white p-4 h-auto rounded-lg flex items-start justify-start gap-3 transition-colors text-left"
                  variant="ghost"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center shrink-0">
                    <CalendarRange className="h-4 w-4 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Para Vestibular</h4>
                    <p className="text-xs text-gray-400">Preparação para vestibulares</p>
                  </div>
                </Button>

                <Button
                  className="bg-[#29335C]/40 hover:bg-[#29335C]/60 text-white p-4 h-auto rounded-lg flex items-start justify-start gap-3 transition-colors text-left"
                  variant="ghost"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center shrink-0">
                    <ListTodo className="h-4 w-4 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Para Cursos</h4>
                    <p className="text-xs text-gray-400">Organização de cursos e matérias</p>
                  </div>
                </Button>
              </div>
            </div>
            <textarea
              className="w-full p-3 bg-[#29335C]/40 text-white rounded-lg mb-4"
              placeholder="Descreva como você enxerga a sua rotina hoje:"
              value={routineDescription}
              onChange={(e) => setRoutineDescription(e.target.value)}
            />
            <textarea
              className="w-full p-3 bg-[#29335C]/40 text-white rounded-lg"
              placeholder="Descreva suas principais metas em uma rotina:"
              value={goalsDescription}
              onChange={(e) => setGoalsDescription(e.target.value)}
            />

            <div className="mt-6">
              <h4 className="text-lg font-bold mb-2">Eventos de Rotina</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  <div className="bg-[#29335C]/30 p-4 rounded-lg">
                    <h5 className="text-white font-medium mb-2">Rotina Obrigatória</h5>
                    {obrigatoriaEvents.map((evento) => (
                      <div key={evento.id} className="relative group flex items-center gap-2 p-2 bg-[#29335C]/40 rounded-lg mb-2">
                        <textarea
                          className="w-full p-1 bg-transparent text-white rounded-lg resize-none"
                          value={evento.event}
                          onChange={(e) => {
                            const updatedEvents = obrigatoriaEvents.map((ev) =>
                              ev.id === evento.id ? { ...ev, event: e.target.value } : ev
                            );
                            setObrigatoriaEvents(updatedEvents);
                          }}
                        />
                        {/* Botão de exclusão que aparece ao arrastar */}
                        <div
                          className="absolute right-0 top-0 h-full transform translate-x-full group-hover:translate-x-0 transition-transform duration-200 flex items-center bg-red-500/80 text-white px-3 cursor-pointer"
                          onClick={() => removeObrigatoriaEvent(evento.id)}
                        >
                          <X className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <textarea
                        className="w-full p-1 bg-transparent text-white rounded-lg resize-none"
                        placeholder="Adicione evento obrigatório"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addObrigatoriaEvent(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#29335C]/30 p-4 rounded-lg">
                    <h5 className="text-white font-medium mb-2">Rotina Variável</h5>
                    {variavelEvents.map((evento) => (
                      <div key={evento.id} className="relative group flex items-center gap-2 p-2 bg-[#29335C]/40 rounded-lg mb-2">
                        <textarea
                          className="w-full p-1 bg-transparent text-white rounded-lg resize-none"
                          value={evento.event}
                          onChange={(e) => {
                            const updatedEvents = variavelEvents.map((ev) =>
                              ev.id === evento.id ? { ...ev, event: e.target.value } : ev
                            );
                            setVariavelEvents(updatedEvents);
                          }}
                        />
                        {/* Botão de exclusão que aparece ao arrastar */}
                        <div
                          className="absolute right-0 top-0 h-full transform translate-x-full group-hover:translate-x-0 transition-transform duration-200 flex items-center bg-red-500/80 text-white px-3 cursor-pointer"
                          onClick={() => removeVariavelEvent(evento.id)}
                        >
                          <X className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <textarea
                        className="w-full p-1 bg-transparent text-white rounded-lg resize-none"
                        placeholder="Adicione evento variável"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addVariavelEvent(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Novo componente de Considerações */}
                <div className="bg-[#29335C]/30 p-4 rounded-lg flex flex-col h-[500px]">
                  <h5 className="text-white font-medium mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 text-[#FF6B00] mr-2" />
                    Considerações da IA
                  </h5>
                  
                  {/* Área de chat com scroll */}
                  <div className="flex-1 overflow-y-auto mb-4 bg-[#29335C]/40 rounded-lg p-3">
                    <div className="space-y-3">
                      {consideracoesMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[85%] p-3 rounded-lg ${
                              message.sender === 'user' 
                                ? 'bg-[#FF6B00] text-white' 
                                : 'bg-[#29335C]/70 text-white/90'
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-[#29335C]/70 text-white/90 p-3 rounded-lg max-w-[85%] flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                              <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={consideracoesEndRef} />
                    </div>
                  </div>
                  
                  {/* Área de input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={consideracoesInput}
                      onChange={(e) => setConsideracoesInput(e.target.value)}
                      placeholder="Digite suas considerações para sua rotina..."
                      className="flex-1 p-2 bg-[#29335C]/60 text-white rounded-lg border border-[#29335C]/80 focus:outline-none focus:border-[#FF6B00]/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendConsideracoes();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendConsideracoes}
                      disabled={consideracoesInput.trim() === "" || isLoading}
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 p-2 rounded-lg flex items-center justify-center"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>


            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-[#FF6B00]/30 text-white hover:bg-[#29335C]/40 rounded-lg"
                onClick={() => setActiveTab("overview")}
              >
                Voltar
              </Button>
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Continuar
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="optimize" className="outline-none">
          <div className="bg-[#29335C]/20 p-6 rounded-xl border border-[#29335C]/30">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FF6B00]" />
              Otimizar sua Rotina
            </h3>
            <p className="text-gray-400 mb-6">
              Nossa IA pode analisar sua rotina atual e sugerir melhorias para maximizar seu desempenho.
            </p>

            <div className="space-y-6">
              <div className="bg-[#29335C]/30 p-4 rounded-lg border border-[#29335C]/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Rotina Atual</h4>
                  <span className="text-xs text-gray-400">Última atualização: Hoje, 12:30</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h5 className="font-medium text-white">Rotina para Concurso Público</h5>
                    <p className="text-xs text-gray-400">8 atividades • 42 horas semanais</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg h-8"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Opções de Otimização</h4>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    className="bg-[#29335C]/40 hover:bg-[#29335C]/60 text-white p-4 h-auto rounded-lg flex items-center justify-between transition-colors"
                    variant="ghost"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                      </div>
                      <div className="text-left">
                        <h5 className="font-medium text-white">Otimização Inteligente</h5>
                        <p className="text-xs text-gray-400">
                          Análise completa da sua rotina pela IA
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </Button>

                  <Button
                    className="bg-[#29335C]/40 hover:bg-[#29335C]/60 text-white p-4 h-auto rounded-lg flex items-center justify-between transition-colors"
                    variant="ghost"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-[#FF6B00]" />
                      </div>
                      <div className="text-left">
                        <h5 className="font-medium text-white">Recomendações Personalizadas</h5>
                        <p className="text-xs text-gray-400">
                          Baseadas no seu perfil de aprendizado
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </Button>

                  <Button
                    className="bg-[#29335C]/40 hover:bg-[#29335C]/60 text-white p-4 h-auto rounded-lg flex items-center justify-between transition-colors"
                    variant="ghost"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-[#FF6B00]" />
                      </div>
                      <div className="text-left">
                        <h5 className="font-medium text-white">Ajustes de Horários</h5>
                        <p className="text-xs text-gray-400">
                          Rebalancear tempos entre atividades
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              className="border-[#FF6B00]/30 text-white hover:bg-[#29335C]/40 rounded-lg"
              onClick={() => setActiveTab("overview")}
            >
              Voltar
            </Button>
            <Button
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Iniciar Otimização
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RotinaContent;