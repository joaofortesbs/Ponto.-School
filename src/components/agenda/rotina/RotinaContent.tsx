
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
  RefreshCw
} from "lucide-react";

const RotinaContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
