import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Users,
  Calendar,
  MessageCircle,
  FileText,
  Settings,
  Filter,
  ChevronRight,
  Sparkles,
  UserPlus,
  Clock,
  Bell,
  Brain,
  Star,
  BookOpen,
  Video,
  Zap,
  ArrowRight,
} from "lucide-react";
import AdicionarGruposModal from '@/components/turmas/modaladicionargruposviacódigo/AdicionarGruposModal';

// Sample data for study groups
const studyGroups = [
  {
    id: "g1",
    name: "Matemática",
    members: [
      {
        id: "m1",
        name: "Ana Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
        online: true,
      },
      {
        id: "m2",
        name: "Pedro Oliveira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
        online: false,
      },
      {
        id: "m3",
        name: "Você",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        online: true,
      },
    ],
    nextMeeting: "16/03, 18:00",
    course: "Física Quântica",
    description:
      "Grupo dedicado ao estudo de Matemática, com foco na preparação para o projeto final da disciplina.",
    hasNewMessages: true,
    lastActivity: "Hoje, 14:30",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    upcomingEvents: [
      {
        id: "e1",
        title: "Discussão sobre Equação de Schrödinger",
        date: "16/03",
        time: "18:00",
      },
      {
        id: "e2",
        title: "Revisão para a prova parcial",
        date: "23/03",
        time: "19:00",
      },
    ],
    resources: [
      {
        id: "r1",
        title: "Resumo: Princípios da Mecânica Quântica",
        type: "pdf",
      },
      { id: "r2", title: "Lista de exercícios resolvidos", type: "pdf" },
      { id: "r3", title: "Vídeo: Experimento da Dupla Fenda", type: "video" },
    ],
  },
  {
    id: "g2",
    name: "Preparação para o Projeto Final",
    members: [
      {
        id: "m4",
        name: "Mariana Santos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
        online: true,
      },
      {
        id: "m5",
        name: "João Costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
        online: false,
      },
      {
        id: "m6",
        name: "Carla Mendes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
        online: true,
      },
      {
        id: "m7",
        name: "Você",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        online: true,
      },
    ],
    nextMeeting: "23/03, 19:00",
    course: "Física Quântica",
    description:
      "Grupo focado na preparação e desenvolvimento do projeto final da disciplina de Física Quântica.",
    hasNewMessages: true,
    lastActivity: "Ontem, 20:15",
    image:
      "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800&q=80",
    upcomingEvents: [
      {
        id: "e3",
        title: "Definição dos tópicos do projeto",
        date: "23/03",
        time: "19:00",
      },
      { id: "e4", title: "Divisão de tarefas", date: "30/03", time: "19:00" },
    ],
    resources: [
      { id: "r4", title: "Template do projeto final", type: "doc" },
      { id: "r5", title: "Exemplos de projetos anteriores", type: "folder" },
      { id: "r6", title: "Guia de formatação", type: "pdf" },
    ],
  },
  {
    id: "g3",
    name: "Grupo de Cálculo Avançado",
    members: [
      {
        id: "m8",
        name: "Roberto Alves",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
        online: false,
      },
      {
        id: "m9",
        name: "Luiza Ferreira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luiza",
        online: true,
      },
      {
        id: "m10",
        name: "Você",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        online: true,
      },
    ],
    nextMeeting: "18/03, 17:30",
    course: "Cálculo Avançado",
    description:
      "Grupo para estudo e resolução de exercícios de Cálculo Avançado, com foco em integrais múltiplas e aplicações.",
    hasNewMessages: false,
    lastActivity: "3 dias atrás",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    upcomingEvents: [
      {
        id: "e5",
        title: "Resolução de exercícios",
        date: "18/03",
        time: "17:30",
      },
    ],
    resources: [
      {
        id: "r7",
        title: "Lista de exercícios - Integrais Múltiplas",
        type: "pdf",
      },
      { id: "r8", title: "Resumo: Teorema de Green", type: "pdf" },
    ],
  },
];

// Sample data for recommended groups
const recommendedGroups = [
  {
    id: "rg1",
    name: "Grupo de Química Orgânica",
    members: 8,
    course: "Química Orgânica",
    description:
      "Grupo para discussão e resolução de exercícios de Química Orgânica, com foco em reações e mecanismos.",
    matchScore: 95,
    image:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    topics: ["Reações Orgânicas", "Mecanismos de Reação", "Estereoquímica"],
  },
  {
    id: "rg2",
    name: "Biologia Molecular Avançada",
    members: 5,
    course: "Biologia Molecular",
    description:
      "Grupo dedicado ao estudo aprofundado de Biologia Molecular, com discussões sobre técnicas e aplicações modernas.",
    matchScore: 87,
    image:
      "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80",
    topics: ["DNA Recombinante", "PCR", "Sequenciamento"],
  },
  {
    id: "rg3",
    name: "Grupo de Estudos de História Contemporânea",
    members: 12,
    course: "História Contemporânea",
    description:
      "Grupo para discussão e análise de eventos históricos contemporâneos e suas implicações no mundo atual.",
    matchScore: 82,
    image:
      "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&q=80",
    topics: ["Guerra Fria", "Globalização", "Conflitos Modernos"],
  },
  {
    id: "rg4",
    name: "Geografia Mundial e Geopolítica",
    members: 7,
    course: "Geografia Mundial",
    description:
      "Grupo focado em discussões sobre geografia política mundial e relações internacionais contemporâneas.",
    matchScore: 78,
    image:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
    topics: ["Geopolítica", "Recursos Naturais", "Conflitos Territoriais"],
  },
];

// Sample data for popular groups
const popularGroups = [
  {
    id: "pg1",
    name: "Programação em Python",
    members: 32,
    course: "Introdução à Programação",
    activity: "Alta",
    image:
      "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=800&q=80",
  },
  {
    id: "pg2",
    name: "Inteligência Artificial e Machine Learning",
    members: 28,
    course: "Ciência da Computação",
    activity: "Alta",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
  },
  {
    id: "pg3",
    name: "Anatomia Humana",
    members: 24,
    course: "Medicina",
    activity: "Média",
    image:
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80",
  },
];

// Sample data for recent activities
const recentActivities = [
  {
    id: "a1",
    groupId: "g1",
    groupName: "Matemática",
    type: "message",
    user: "Ana Silva",
    content:
      "Compartilhou um novo material: 'Resumo sobre Dualidade Onda-Partícula'",
    time: "Hoje, 14:30",
  },
  {
    id: "a2",
    groupId: "g2",
    groupName: "Preparação para o Projeto Final",
    type: "event",
    user: "Sistema",
    content:
      "Novo evento agendado: 'Definição dos tópicos do projeto' para 23/03 às 19:00",
    time: "Ontem, 20:15",
  },
  {
    id: "a3",
    groupId: "g1",
    groupName: "Matemática",
    type: "member",
    user: "Sistema",
    content: "Pedro Oliveira entrou no grupo",
    time: "2 dias atrás",
  },
  {
    id: "a4",
    groupId: "g3",
    groupName: "Grupo de Cálculo Avançado",
    type: "file",
    user: "Roberto Alves",
    content:
      "Adicionou um novo arquivo: 'Lista de exercícios - Integrais Múltiplas'",
    time: "3 dias atrás",
  },
];

export default function GruposEstudo2() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
    const [showAdicionarGruposModal, setShowAdicionarGruposModal] = useState(false);

  // Filter groups based on search query
  const filteredGroups = studyGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter recommended groups based on search query
  const filteredRecommended = recommendedGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle group selection
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
  };

  // Handle back to groups list
  const handleBackToList = () => {
    setSelectedGroup(null);
  };

  // Get selected group details
  const selectedGroupDetails = studyGroups.find(
    (group) => group.id === selectedGroup,
  );

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-md">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
              Grupos de Estudo 2
            </h1>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm font-open-sans">
              Colabore, compartilhe e aprenda com seus colegas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder="Buscar grupos..."
              className="pl-9 w-[250px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
          onClick={() => setShowAdicionarGruposModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Criar Novo Grupo
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {!selectedGroup ? (
        // Groups List View
        <div className="space-y-6">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-white dark:bg-[#1E293B] p-1 rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <TabsTrigger
                  value="meus-grupos"
                  className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
                >
                  <Users className="h-4 w-4 mr-2" /> Meus Grupos
                </TabsTrigger>

                <TabsTrigger
                  value="recomendados"
                  className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
                >
                  <Sparkles className="h-4 w-4 mr-2" /> Recomendados
                </TabsTrigger>

                <TabsTrigger
                  value="populares"
                  className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
                >
                  <Star className="h-4 w-4 mr-2" /> Populares
                </TabsTrigger>

                <TabsTrigger
                  value="atividades"
                  className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
                >
                  <Bell className="h-4 w-4 mr-2" /> Atividades Recentes
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-4 w-4 mr-1" /> Filtrar
              </Button>
            </div>

            {/* My Groups Tab */}
            <TabsContent value="meus-grupos" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px] cursor-pointer"
                    onClick={() => handleGroupSelect(group.id)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={group.image}
                        alt={group.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white font-montserrat">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-200 font-open-sans">
                          {group.course}
                        </p>
                      </div>
                      {group.hasNewMessages && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Novas mensagens
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex -space-x-2">
                          {group.members.slice(0, 3).map((member) => (
                            <div key={member.id} className="relative">
                              <Avatar className="border-2 border-white dark:border-[#1E293B] w-8 h-8">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {member.online && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1E293B]"></div>
                              )}
                            </div>
                          ))}
                          {group.members.length > 3 && (
                            <Avatar className="border-2 border-white dark:border-[#1E293B] w-8 h-8 bg-[#FF6B00]/10 text-[#FF6B00]">
                              <AvatarFallback>
                                +{group.members.length - 3}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
                          <span>Última atividade: {group.lastActivity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                        <Calendar className="h-4 w-4 text-[#FF6B00]" />
                        <span>Próxima reunião: {group.nextMeeting}</span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGroupSelect(group.id);
                          }}
                        >
                          Acessar Grupo
                        </Button>

                        <Button
                          variant="outline"
                          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            // In a real app, this would navigate to the chat
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" /> Chat
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Recommended Groups Tab */}
            <TabsContent value="recomendados" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecommended.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px] cursor-pointer"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={group.image}
                        alt={group.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white font-montserrat">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-200 font-open-sans">
                          {group.course}
                        </p>
                      </div>
                      <div className="absolute top-3 right-3 bg-[#FF6B00] text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" /> {group.matchScore}
                        % match
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {group.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {group.topics.map((topic, index) => (
                          <Badge
                            key={index}
                            className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Users className="h-4 w-4 text-[#FF6B00]" />
                          <span>{group.members} membros</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase text-xs">
                          Participar do Grupo
                        </Button>

                        <Button
                          variant="outline"
                          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat text-xs"
                        >
                          <Search className="h-4 w-4 mr-1" /> Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Popular Groups Tab */}
            <TabsContent value="populares" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px] cursor-pointer"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={group.image}
                        alt={group.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white font-montserrat">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-200 font-open-sans">
                          {group.course}
                        </p>
                      </div>
                      <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Popular
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Users className="h-4 w-4 text-[#FF6B00]" />
                          <span>{group.members} membros</span>
                        </div>
                        <Badge
                          className={`
                          ${
                            group.activity === "Alta"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : group.activity === "Média"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          }
                        `}
                        >
                          Atividade {group.activity}
                        </Badge>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase text-xs">
                          Participar do Grupo
                        </Button>

                        <Button
                          variant="outline"
                          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat text-xs"
                        >
                          <Search className="h-4 w-4 mr-1" /> Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Recent Activities Tab */}
            <TabsContent value="atividades" className="space-y-6">
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat mb-4">
                    Atividades Recentes
                  </h3>

                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FF6B00]/5 dark:hover:bg-[#FF6B00]/10 transition-colors cursor-pointer border border-transparent hover:border-[#FF6B00]/20"
                        onClick={() => handleGroupSelect(activity.groupId)}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center">
                          {activity.type === "message" ? (
                            <MessageCircle className="h-5 w-5 text-[#FF6B00]" />
                          ) : activity.type === "event" ? (
                            <Calendar className="h-5 w-5 text-[#FF6B00]" />
                          ) : activity.type === "member" ? (
                            <UserPlus className="h-5 w-5 text-[#FF6B00]" />
                          ) : (
                            <FileText className="h-5 w-5 text-[#FF6B00]" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {activity.user}                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {activity.content}
                                                      </p>
                          <p className="text-xs text-[#FF6B00] mt-1">
                            Em: {activity.groupName}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8C40]"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Group Detail View
        <div className="space-y-6">
          {/* Group Header */}
          <div className="relative h-64 rounded-xl overflow-hidden">
            <img
              src={selectedGroupDetails?.image}
              alt={selectedGroupDetails?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
                onClick={handleBackToList}
              >
                <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Voltar para
                Grupos
              </Button>
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
              >
                <MessageCircle className="h-4 w-4 mr-1" /> Chat do Grupo
              </Button>

              <Button
                variant="ghost"
                className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
              >
                <Settings className="h-4 w-4 mr-1" /> Configurações
              </Button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl font-bold text-white font-montserrat mb-2">
                {selectedGroupDetails?.name}
              </h1>

              <div className="flex items-center gap-4">
                <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] backdrop-blur-sm">
                  {selectedGroupDetails?.course}
                </Badge>

                <div className="flex items-center gap-1 text-white text-sm">
                  <Users className="h-4 w-4 text-[#FF6B00]" />
                  <span>{selectedGroupDetails?.members.length} membros</span>
                </div>

                <div className="flex items-center gap-1 text-white text-sm">
                  <Calendar className="h-4 w-4 text-[#FF6B00]" />
                  <span>
                    Próxima reunião: {selectedGroupDetails?.nextMeeting}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Group Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Group Info */}
            <div className="space-y-6">
              {/* Group Description */}
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat mb-3">
                    Sobre o Grupo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-open-sans">
                    {selectedGroupDetails?.description}
                  </p>
                </CardContent>
              </Card>

              {/* Group Members */}
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat">
                      Membros
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      <UserPlus className="h-4 w-4 mr-1" /> Convidar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedGroupDetails?.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {member.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1E293B]"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.online ? "Online" : "Offline"}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mentor IA Recommendations */}
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-[#FF6B00]" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat">
                      Recomendações do Mentor IA
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-3 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-[#FF6B00] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Material Complementar
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            "Fundamentos de Mecânica Quântica" - Recomendado
                            para o próximo encontro
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-3 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <div className="flex items-start gap-2">
                        <Video className="h-4 w-4 text-[#FF6B00] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Vídeo Sugerido
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            "Entendendo a Equação de Schrödinger" - Complementa
                            as discussões recentes
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-3 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-[#FF6B00] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Dica de Estudo
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Revisar o conceito de Dualidade Onda-Partícula antes
                            da próxima reunião
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Upcoming Events and Resources */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat">
                      Próximos Eventos
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Agendar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedGroupDetails?.upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white dark:bg-[#1E293B] rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Agendado
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-[#FF6B00]" />
                            <span>{event.date}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-[#FF6B00]" />
                            <span>{event.time}</span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                          >
                            Detalhes
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                          >
                            Participar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat">
                      Materiais Compartilhados
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedGroupDetails?.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[#FF6B00]/5 dark:hover:bg-[#FF6B00]/10 transition-colors cursor-pointer border border-transparent hover:border-[#FF6B00]/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center">
                            {resource.type === "pdf" ? (
                              <FileText className="h-5 w-5 text-[#FF6B00]" />
                            ) : resource.type === "video" ? (
                              <Video className="h-5 w-5 text-[#FF6B00]" />
                            ) : resource.type === "doc" ? (
                              <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                            ) : (
                              <FileText className="h-5 w-5 text-[#FF6B00]" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {resource.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {resource.type === "pdf"
                                ? "Documento PDF"
                                : resource.type === "video"
                                  ? "Vídeo"
                                  : resource.type === "doc"
                                    ? "Documento"
                                    : resource.type === "folder"
                                      ? "Pasta"
                                      : "Arquivo"}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                        >
                          Baixar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Chat */}
            <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md h-[calc(100vh-400px)] flex flex-col">
              <div className="p-4 border-b border-[#FF6B00]/10 dark:border-[#FF6B00]/20 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-[#FF6B00]" /> Chat do
                  Grupo
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Chat messages would go here */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Ana Silva
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        14:30
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Olá pessoal! Compartilhei um novo material sobre Dualidade
                      Onda-Partícula que pode ajudar na nossa discussão de
                      amanhã.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        14:35
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Você
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Obrigado Ana! Vou dar uma olhada. Alguém tem dúvidas sobre
                      o exercício 3 da lista?
                    </p>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
                    <AvatarFallback>V</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" />
                    <AvatarFallback>P</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Pedro Oliveira
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        14:40
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Eu tenho dúvida sim! Podemos discutir isso na reunião de
                      amanhã? Estou com dificuldade na parte de aplicar o
                      princípio da incerteza.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    Hoje, 15:00
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
                  />
                  <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white">
                    Enviar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
        {/* Modal para adicionar grupos via código */}
        <AdicionarGruposModal
            open={showAdicionarGruposModal}
            onOpenChange={setShowAdicionarGruposModal}
        />
    </div>
  );
}