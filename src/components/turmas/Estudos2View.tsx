import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Lightbulb,
  Target,
  LineChart,
  Search,
  Plus,
  Users2,
  MessageCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  BookOpen,
  FileText,
  Code,
  Edit3,
  Sparkles,
  BookMarked,
  FileQuestion,
  Video,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import GroupDetail from "./group-detail";

// Dados simulados para os grupos de estudo
const gruposEstudo = [
  {
    id: "g1",
    nome: "Estudos 2 - Mecânica Quântica Avançada",
    disciplina: "Física Quântica",
    membros: ["Ana", "Pedro", "Você"],
    proximaReuniao: "16/03, 18:00",
    progresso: 68.5,
    novasMensagens: true,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
    curso: "Física Quântica",
    descricao:
      "Grupo dedicado ao estudo de mecânica quântica e suas aplicações na física moderna. Discutimos desde os fundamentos até aplicações avançadas como computação quântica e criptografia quântica.",
    tags: ["avançado", "teórico", "prático"],
    dataInicio: "10/01/2023",
    recomendacoesIA: [
      {
        tipo: "material",
        titulo: "Fundamentos da Equação de Schrödinger",
        descricao: "Artigo com explicações detalhadas e exemplos práticos",
        icone: <BookMarked className="h-4 w-4 text-blue-500" />,
        relevancia: 98,
      },
      {
        tipo: "exercicio",
        titulo: "Problemas de Mecânica Quântica Avançada",
        descricao: "Conjunto de exercícios com dificuldade progressiva",
        icone: <FileQuestion className="h-4 w-4 text-green-500" />,
        relevancia: 95,
      },
      {
        tipo: "video",
        titulo: "Computação Quântica: Princípios e Aplicações",
        descricao: "Vídeo-aula com demonstrações visuais",
        icone: <Video className="h-4 w-4 text-red-500" />,
        relevancia: 92,
      },
    ],
  },
  {
    id: "g2",
    nome: "Estudos 2 - Projeto Final de Física Aplicada",
    disciplina: "Física Aplicada",
    membros: ["Mariana", "João", "Carla", "Você"],
    proximaReuniao: "23/03, 19:00",
    progresso: 45.6,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    curso: "Física Aplicada",
    descricao:
      "Grupo para desenvolvimento do projeto final da disciplina de Física Aplicada, com foco em aplicações práticas e experimentais.",
    tags: ["intermediário", "prático", "projeto"],
    dataInicio: "15/02/2023",
    recomendacoesIA: [
      {
        tipo: "material",
        titulo: "Metodologias para Projetos Experimentais",
        descricao: "Guia completo sobre estruturação de projetos científicos",
        icone: <BookMarked className="h-4 w-4 text-blue-500" />,
        relevancia: 97,
      },
      {
        tipo: "exercicio",
        titulo: "Simulações de Física Aplicada",
        descricao: "Laboratório virtual com experimentos interativos",
        icone: <FileQuestion className="h-4 w-4 text-green-500" />,
        relevancia: 94,
      },
      {
        tipo: "video",
        titulo: "Apresentação de Projetos Científicos",
        descricao: "Técnicas para apresentações eficazes de resultados",
        icone: <Video className="h-4 w-4 text-red-500" />,
        relevancia: 90,
      },
    ],
  },
  {
    id: "g3",
    nome: "Estudos 2 - Cálculo Avançado e Aplicações",
    disciplina: "Matemática",
    membros: ["Roberto", "Luiza", "Você"],
    proximaReuniao: "18/03, 17:30",
    progresso: 72.3,
    novasMensagens: false,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    curso: "Matemática",
    descricao:
      "Grupo de estudos focado em cálculo avançado, incluindo cálculo multivariável, equações diferenciais e aplicações em problemas reais.",
    tags: ["avançado", "teórico", "matemática"],
    dataInicio: "05/01/2023",
    recomendacoesIA: [
      {
        tipo: "material",
        titulo: "Equações Diferenciais Parciais",
        descricao: "Material avançado com exemplos resolvidos passo a passo",
        icone: <BookMarked className="h-4 w-4 text-blue-500" />,
        relevancia: 99,
      },
      {
        tipo: "exercicio",
        titulo: "Problemas de Cálculo Multivariável",
        descricao: "Exercícios desafiadores com soluções comentadas",
        icone: <FileQuestion className="h-4 w-4 text-green-500" />,
        relevancia: 96,
      },
      {
        tipo: "video",
        titulo: "Aplicações do Cálculo em Problemas Reais",
        descricao: "Casos de estudo em engenharia e ciências",
        icone: <Video className="h-4 w-4 text-red-500" />,
        relevancia: 93,
      },
    ],
  },
];

// Dados simulados para grupos recomendados
const gruposRecomendados = [
  {
    id: "rg1",
    nome: "Estudos 2 - Grupo de Química Orgânica",
    disciplina: "Química Orgânica",
    membros: 8,
    matchScore: 95,
    imagem:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    curso: "Química",
    descricao:
      "Grupo de estudos para a disciplina de Química Orgânica, com foco em reações, mecanismos e síntese orgânica.",
    tags: ["intermediário", "química", "orgânica"],
    progresso: 65,
    recomendacoesIA: [
      {
        tipo: "material",
        titulo: "Mecanismos de Reações Orgânicas",
        descricao: "Guia completo sobre os principais mecanismos de reação",
        icone: <BookMarked className="h-4 w-4 text-blue-500" />,
        relevancia: 98,
      },
      {
        tipo: "exercicio",
        titulo: "Identificação de Grupos Funcionais",
        descricao: "Exercícios práticos de identificação e nomenclatura",
        icone: <FileQuestion className="h-4 w-4 text-green-500" />,
        relevancia: 95,
      },
    ],
  },
  {
    id: "rg2",
    nome: "Estudos 2 - Biologia Molecular Avançada",
    disciplina: "Biologia Molecular",
    membros: 5,
    matchScore: 87,
    imagem:
      "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80",
    curso: "Biologia",
    descricao:
      "Grupo para discussão de tópicos avançados em biologia molecular, incluindo técnicas de laboratório e análise de dados genômicos.",
    tags: ["avançado", "biologia", "molecular"],
    progresso: 42,
    recomendacoesIA: [
      {
        tipo: "material",
        titulo: "Técnicas Avançadas de Sequenciamento",
        descricao: "Material atualizado sobre as mais recentes tecnologias",
        icone: <BookMarked className="h-4 w-4 text-blue-500" />,
        relevancia: 97,
      },
      {
        tipo: "exercicio",
        titulo: "Análise de Dados Genômicos",
        descricao: "Prática com ferramentas computacionais para bioinformática",
        icone: <FileQuestion className="h-4 w-4 text-green-500" />,
        relevancia: 94,
      },
    ],
  },
];

// Componente para o card de grupo de estudo
const GrupoEstudoCard = ({
  grupo,
  onClick,
}: {
  grupo: any;
  onClick: (grupo: any) => void;
}) => {
  return (
    <div
      className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
      onClick={() => onClick(grupo)}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={grupo.imagem}
          alt={grupo.nome}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3 w-full">
          <div className="flex justify-between items-center">
            <Badge className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs font-medium px-2 py-1">
              {grupo.disciplina}
            </Badge>
            <Badge className="bg-[#001427]/80 text-white text-xs px-2 py-1">
              {grupo.nivel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
          {grupo.nome}
        </h3>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex -space-x-2 mr-2">
            {Array.isArray(grupo.membros) ? (
              grupo.membros.map((membro, index) => (
                <Avatar
                  key={index}
                  className="h-6 w-6 border-2 border-white dark:border-[#1E293B]"
                >
                  <AvatarFallback className="text-[10px] bg-[#FF6B00]/10 text-[#FF6B00]">
                    {membro.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))
            ) : (
              <span className="text-sm">{grupo.membros} membros</span>
            )}
          </div>
          {Array.isArray(grupo.membros) && (
            <span>{grupo.membros.length} membros</span>
          )}
        </div>

        {grupo.progresso !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                Progresso
              </span>
              <span className="font-medium text-[#FF6B00]">
                {grupo.progresso.toFixed(1)}%
              </span>
            </div>
            <Progress value={grupo.progresso} className="h-1.5" />
          </div>
        )}

        {grupo.proximaReuniao && (
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-3">
            <Calendar className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
            <span>Próxima reunião: {grupo.proximaReuniao}</span>
          </div>
        )}

        {grupo.matchScore !== undefined && (
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-3">
            <Target className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
            <span>
              Compatibilidade:{" "}
              <span className="font-medium text-[#FF6B00]">
                {grupo.matchScore}%
              </span>
            </span>
          </div>
        )}

        {grupo.recomendacoesIA && grupo.recomendacoesIA.length > 0 && (
          <div className="mb-3 mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
            <div className="flex items-center text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
              <Zap className="h-3.5 w-3.5 mr-1" />
              <span>Recomendação IA</span>
            </div>
            <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
              {grupo.recomendacoesIA[0].icone}
              <span className="ml-1 line-clamp-1">
                {grupo.recomendacoesIA[0].titulo}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            {grupo.matchScore !== undefined ? "Ver detalhes" : "Acessar grupo"}
          </Button>
          <Button
            size="sm"
            className="text-xs bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          >
            {grupo.matchScore !== undefined
              ? "Solicitar entrada"
              : "Iniciar chat"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente para a ferramenta de IA
const FerramentaIA = ({
  titulo,
  descricao,
  icone,
  cor,
  acao,
}: {
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  acao: string;
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col items-center p-5 text-center`}
    >
      <div
        className={`w-12 h-12 rounded-full ${cor} flex items-center justify-center mb-3`}
      >
        {icone}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">
        {titulo}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        {descricao}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="text-xs border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
      >
        {acao}
      </Button>
    </div>
  );
};

// Componente para recomendações de estudo IA
const RecomendacoesEstudoIA = ({ grupo }: { grupo: any }) => {
  if (!grupo.recomendacoesIA || grupo.recomendacoesIA.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800 p-4 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            Recomendações de Estudo IA
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Personalizadas para {grupo.nome}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {grupo.recomendacoesIA.map((rec: any, index: number) => (
          <div
            key={index}
            className="flex items-start p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
          >
            <div className="p-2 bg-white dark:bg-[#1E293B] rounded-lg mr-3">
              {rec.icone}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {rec.titulo}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {rec.descricao}
              </p>
              <div className="flex items-center mt-1">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                  {rec.tipo}
                </Badge>
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                  {rec.relevancia}% relevante
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white">
        <Lightbulb className="h-4 w-4 mr-2" /> Gerar mais recomendações
      </Button>
    </div>
  );
};

export default function Estudos2View() {
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  const handleGroupClick = (grupo: any) => {
    setSelectedGroup(grupo);
  };

  const handleBackFromGroup = () => {
    setSelectedGroup(null);
  };

  if (selectedGroup) {
    return (
      <div className="w-full h-full overflow-hidden">
        <div className="w-full h-full overflow-y-auto p-6 bg-[#f7f9fa] dark:bg-[#001427]">
          <Button
            variant="outline"
            className="mb-6"
            onClick={handleBackFromGroup}
          >
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" /> Voltar para
            grupos
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GroupDetail group={selectedGroup} onBack={handleBackFromGroup} />
            </div>

            <div className="space-y-6">
              <RecomendacoesEstudoIA grupo={selectedGroup} />

              <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800 p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-[#FF6B00]" /> Técnicas de
                  Estudo Recomendadas
                </h3>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 transition-colors cursor-pointer">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      Técnica Pomodoro Adaptada
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      25 minutos de estudo focado, 5 minutos de descanso. Ideal
                      para o conteúdo deste grupo.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 transition-colors cursor-pointer">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      Mapas Mentais
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Organize os conceitos complexos visualmente para melhor
                      compreensão.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 transition-colors cursor-pointer">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      Ensino Recíproco
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Explique os conceitos para outros membros do grupo para
                      solidificar seu conhecimento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] space-y-6 transition-colors duration-300">
      <div className="bg-[#001427] text-white p-6 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#001427] to-[#001427]/80"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80')] bg-cover bg-center"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-6 w-6 text-[#FF6B00]" />
            <h1 className="text-2xl font-bold">Estudos 2</h1>
          </div>
          <p className="text-gray-300 mb-4">
            Organize, aprenda e evolua com métodos inteligentes - Versão 2
          </p>

          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Criar Novo Grupo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Search className="h-4 w-4 mr-1" /> Buscar grupos...
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Meus Grupos
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Recomendados IA
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Estatísticas
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Física
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Matemática
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Química
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white dark:bg-[#1E293B] p-1 rounded-lg border border-gray-100 dark:border-gray-800">
            <TabsTrigger
              value="meus-grupos"
              className="rounded-md data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00]"
            >
              <Users2 className="h-4 w-4 mr-2" /> Meus Grupos
            </TabsTrigger>
            <TabsTrigger
              value="recomendados"
              className="rounded-md data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00]"
            >
              <Lightbulb className="h-4 w-4 mr-2" /> Recomendados IA
            </TabsTrigger>
            <TabsTrigger
              value="estatisticas"
              className="rounded-md data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00]"
            >
              <LineChart className="h-4 w-4 mr-2" /> Estatísticas
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar grupos..."
                className="pl-10 bg-white dark:bg-[#1E293B] border-gray-200 dark:border-gray-700 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <TabsContent value="meus-grupos" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gruposEstudo.map((grupo) => (
                  <GrupoEstudoCard
                    key={grupo.id}
                    grupo={grupo}
                    onClick={handleGroupClick}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recomendados" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gruposRecomendados.map((grupo) => (
                  <GrupoEstudoCard
                    key={grupo.id}
                    grupo={grupo}
                    onClick={handleGroupClick}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="estatisticas" className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4">
                  <LineChart className="h-8 w-8 text-[#FF6B00]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Estatísticas em breve
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Esta funcionalidade estará disponível em uma atualização
                  futura.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-[#FF6B00]" />
          Ferramentas de Estudo Inteligentes - Versão 2
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FerramentaIA
            titulo="Assistente de Estudos IA 2.0"
            descricao="Obtenha recomendações específicas, resumos inteligentes e resolução de dúvidas em tempo real."
            icone={<Brain className="h-6 w-6 text-white" />}
            cor="bg-blue-500"
            acao="Acessar Assistente"
          />

          <FerramentaIA
            titulo="Análise de Desempenho 2.0"
            descricao="Visualize seu progresso, identifique pontos fortes e áreas para melhorar com análises realizadas."
            icone={<LineChart className="h-6 w-6 text-white" />}
            cor="bg-purple-500"
            acao="Ver Análises"
          />

          <FerramentaIA
            titulo="Metas e Objetivos 2.0"
            descricao="Defina metas de estudo, acompanhe seu progresso e mantenha-se motivado com recompensas."
            icone={<Target className="h-6 w-6 text-white" />}
            cor="bg-green-500"
            acao="Definir Metas"
          />
        </div>
      </div>
    </div>
  );
}
