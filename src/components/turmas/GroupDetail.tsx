import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Calendar,
  Clock,
  BookOpen,
  MessageCircle,
  Users,
  FileText,
  Brain,
  Target,
  Award,
  Zap,
  BarChart,
  CheckCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Rocket,
  Info,
  Video,
  Play,
  FileQuestion,
  Sparkles,
  Plus,
  Search,
  Eye,
  CheckSquare,
  Presentation,
  Share2,
} from "lucide-react";

interface GroupDetailProps {
  group: any; // Replace with proper type
  onBack: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ group, onBack }) => {
  const [activeTab, setActiveTab] = useState("visao-geral");

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="relative h-64 rounded-xl overflow-hidden">
        <img
          src={group.imagem || "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1200&q=90"}
          alt={group.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
            onClick={onBack}
          >
            <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Voltar
          </Button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center border-2 border-white">
              {group.icone}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-montserrat">
                {group.nome}
              </h1>
              <p className="text-gray-200 font-open-sans">
                {group.disciplina} • {group.membros} participantes
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] backdrop-blur-sm">
              {group.tipoGrupo === "estudo" ? "Grupo de Estudos" : 
               group.tipoGrupo === "projeto" ? "Projeto Colaborativo" : 
               group.tipoGrupo === "discussao" ? "Grupo de Discussão" : 
               group.tipoGrupo === "monitoria" ? "Monitoria" : "Grupo de Revisão"}
            </Badge>
            
            {group.proximaReuniao && (
              <div className="flex items-center gap-1 text-white text-sm">
                <Calendar className="h-4 w-4 text-[#FF6B00]" />
                <span>Próxima reunião: {group.proximaReuniao}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white dark:bg-[#1E293B] p-1 rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          <TabsTrigger
            value="visao-geral"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <Info className="h-4 w-4 mr-2" /> Visão Geral
          </TabsTrigger>
          
          <TabsTrigger
            value="atividades"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <CheckSquare className="h-4 w-4 mr-2" /> Atividades
          </TabsTrigger>
          
          <TabsTrigger
            value="discussoes"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <MessageCircle className="h-4 w-4 mr-2" /> Discussões
          </TabsTrigger>
          
          <TabsTrigger
            value="membros"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <Users className="h-4 w-4 mr-2" /> Membros
          </TabsTrigger>
          
          <TabsTrigger
            value="materiais"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <FileText className="h-4 w-4 mr-2" /> Materiais
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral Tab */}
        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações do Grupo */}
            <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-4">
                  <Info className="h-5 w-5 mr-2 text-[#FF6B00]" /> Informações do Grupo
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descrição
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {group.descricao || "Este grupo foi criado para estudos colaborativos e compartilhamento de conhecimento."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Objetivos
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {group.objetivos || "Aprofundar conhecimentos na disciplina, preparar para avaliações e desenvolver projetos colaborativos."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Frequência de Encontros
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {group.frequencia === "diario" ? "Diário" :
                         group.frequencia === "semanal" ? "Semanal" :
                         group.frequencia === "quinzenal" ? "Quinzenal" :
                         group.frequencia === "mensal" ? "Mensal" : "Flexível"}
                      </p>
                    </div>
                  </div>
                  
                  {group.horarios && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Horários
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {group.horarios}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Participantes
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {group.membros} membros ativos
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {group.tags && group.tags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Próximas Atividades */}
            <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-4">
                  <Calendar className="h-5 w-5 mr-2 text-[#FF6B00]" /> Próximas Atividades
                </h3>
                
                <div className="space-y-4">
                  {/* Atividade 1 */}
                  <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-[#FF6B00]" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                          Sessão de Estudos
                        </h4>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Próxima
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Revisão dos principais conceitos para a prova.
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#FF6B00]" />
                        <span>Amanhã, 18:00</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#FF6B00]" />
                        <span>5 confirmados</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Atividade 2 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Presentation className="h-4 w-4 text-[#FF6B00]" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                          Apresentação de Tópicos
                        </h4>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Planejada
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Cada membro apresentará um tópico específico para discussão.
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#FF6B00]" />
                        <span>Sexta-feira, 19:00</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#FF6B00]" />
                        <span>3 confirmados</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Atividade 3 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#FF6B00]" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                          Resolução de Exercícios
                        </h4>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Planejada
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Resolução colaborativa da lista de exercícios da semana.
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#FF6B00]" />
                        <span>Segunda-feira, 17:30</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#FF6B00]" />
                        <span>7 confirmados</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="link"
                  className="mt-4 p-0 h-auto text-[#FF6B00] hover:text-[#FF8C40]"
                >
                  Ver todas as atividades <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Sugestões do Mentor IA */}
          <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-[#FF6B00]" /> Sugestões do Mentor IA
                </h3>
                <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Personalizado
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sugestão 1 */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                    <FileText className="h-5 w-5 mr-2 text-[#FF6B00]" /> Material Recomendado
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-open-sans">
                    Baseado nos tópicos discutidos, recomendo este artigo sobre os principais conceitos da disciplina.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat">
                    Ver Material
                  </Button>
                </div>
                
                {/* Sugestão 2 */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                    <Video className="h-5 w-5 mr-2 text-[#FF6B00]" /> Vídeo Complementar
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-open-sans">
                    Este vídeo explica de forma visual os conceitos que o grupo está estudando atualmente.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat">
                    Assistir Vídeo
                  </Button>
                </div>
                
                {/* Sugestão 3 */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                    <CheckSquare className="h-5 w-5 mr-2 text-[#FF6B00]" /> Atividade Sugerida
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-open-sans">
                    Uma sessão de resolução de problemas em grupo seria benéfica para fixar os conceitos estudados.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat">
                    Planejar Atividade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Atividades Tab */}
        <TabsContent value="atividades" className="space-y-6">
          <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-[#FF6B00]" /> Atividades do Grupo
                </h3>
                <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                  <Plus className="h-4 w-4 mr-1" /> Nova Atividade
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Atividades Agendadas */}
                <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-3">
                  Atividades Agendadas
                </h4>
                
                <div className="space-y-3">
                  {/* Atividade 1 */}
                  <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-[#FF6B00]" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                          Sessão de Estudos
                        </h4>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Amanhã
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Revisão dos principais conceitos para a prova.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-[#FF6B00]" />
                          <span>Amanhã, 18:00</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-[#FF6B00]" />
                          <span>5 confirmados</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10">
                        Confirmar Presença
                      </Button>
                    </div>
                  </div>
                  
                  {/* Atividade 2 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Presentation className="h-4 w-4 text-[#FF6B00]" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                          Apresentação de Tópicos
                        </h4>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Sexta-feira
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Cada membro apresentará um tópico específico para discussão.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-[#FF6B00]" />
                          <span>Sexta-feira, 19:00</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-[#FF6B00]" />
                          <span>3 confirmados</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10">
                        Confirmar Presença
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Atividades Concluídas */}
                <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mt-6 mb-3">
                  Atividades Concluídas
                </h4>
                
                <div className="space-y-3">
                  {/* Atividade Concluída 1 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700 opacity-70">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-green-500" />
                        <h4 className="text-base font-medium text-gray-500 dark:text-gray-400">
                          Sessão de Estudos Inicial
                        </h4>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Concluída
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                      Introdução aos principais tópicos e organização do plano de estudos.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          <span>10/03/2023</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-gray-500" />
                          <span>8 participantes</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-500">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Discussões Tab */}
        <TabsContent value="discussoes" className="space-y-6">
          <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-[#FF6B00]" /> Discussões do Grupo
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      placeholder="Buscar discussões..."
                      className="pl-9 w-[200px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg h-9 bg-transparent border"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                    <Plus className="h-4 w-4 mr-1" /> Nova Discussão
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Discussão 1 */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 hover:border-[#FF6B00]/30 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border-2 border-[#FF6B00]/20">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" />
                      <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h5 className="text-base font-bold text-gray-900 dark:text-white font-montserrat mb-1">
                        Dúvida sobre o conceito principal
                      </h5>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <span>Por: Ana Silva</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#FF6B00]" />
                          <span>Hoje, 14:30</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Estou com dificuldade para entender o conceito X que foi discutido na última aula. Alguém poderia explicar de forma mais detalhada?
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <MessageCircle className="h-3 w-3 text-[#FF6B00]" />
                          <span>5 respostas</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Eye className="h-3 w-3 text-[#FF6B00]" />
                          <span>12 visualizações</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Discussão 2 */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border-2 border-[#FF6B00]/20">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" />
                      <AvatarFallback>PO</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h5 className="text-base font-bold text-gray-900 dark:text-white font-montserrat mb-1">
                        Material complementar interessante
                      </h5>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <span>Por: Pedro Oliveira</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#FF6B00]" />
                          <span>Ontem, 18:15</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Encontrei este artigo que complementa muito bem o que estamos estudando. Achei que seria útil compartilhar com o grupo.
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <MessageCircle className="h-3 w-3 text-[#FF6B00]" />
                          <span>3 respostas</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Eye className="h-3 w-3 text-[#FF6B00]" />
                          <span>8 visualizações</span>
