import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import GroupDetailHeader from "./group-detail/GroupDetailHeader";
import MaterialsSection from "./group-detail/MaterialsSection";
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
  FileUp,
  Folder,
  Download,
  MoreVertical,
  UserPlus,
  Settings,
} from "lucide-react";
import { DiscussoesTab } from "./group-detail/tabs/DiscussoesTab";
import AjustesTab from "./group-detail/tabs/AjustesTab";
import GroupSettingsModal from "./group-detail/GroupSettingsModal";

interface GroupDetailProps {
  group: any; // Replace with proper type
  onBack: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ group, onBack }) => {
  const [activeTab, setActiveTab] = useState("discussoes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { theme } = useTheme();

  // Mock data for the component
  const members = [
    {
      id: "1",
      name: "Ana Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      role: "Administrador",
      isOnline: true,
      lastActive: "",
    },
    {
      id: "2",
      name: "Pedro Santos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
      role: "Membro",
      isOnline: false,
      lastActive: "Há 2 horas",
    },
    {
      id: "3",
      name: "Maria Oliveira",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      role: "Membro",
      isOnline: true,
      lastActive: "",
    },
  ];

  const files = [
    {
      id: "1",
      name: "Resumo - Mecânica Quântica.pdf",
      size: "2.4 MB",
      uploadedBy: "Ana Silva",
      uploadedAt: "Ontem, 15:30",
    },
    {
      id: "2",
      name: "Lista de Exercícios 3.pdf",
      size: "1.8 MB",
      uploadedBy: "Pedro Santos",
      uploadedAt: "12/03/2023",
    },
    {
      id: "3",
      name: "Artigo - Aplicações da Mecânica Quântica.pdf",
      size: "3.5 MB",
      uploadedBy: "Maria Oliveira",
      uploadedAt: "10/03/2023",
    },
  ];

  const events = [
    {
      id: "1",
      title: "Encontro do Grupo",
      description:
        "Discussão sobre os últimos tópicos e resolução de exercícios.",
      date: "15/03",
      time: "19:00 - 20:30",
      location: "Sala Virtual",
      participants: ["1", "2", "3"],
    },
    {
      id: "2",
      title: "Palestra: Computação Quântica",
      description:
        "Palestra com o Prof. Dr. Ricardo Almeida sobre os avanços recentes em computação quântica.",
      date: "19/03",
      time: "18:00 - 19:30",
      location: "Auditório Virtual",
      participants: ["1", "3"],
    },
  ];

  const topics = [
    { id: "1", title: "Fundamentos da Mecânica Quântica" },
    { id: "2", title: "Equação de Schrödinger" },
    { id: "3", title: "Princípio da Incerteza" },
    { id: "4", title: "Computação Quântica" },
  ];

  const tools = [
    {
      id: "1",
      name: "Quadro Branco",
      description: "Colabore em tempo real com outros membros",
      icon: "whiteboard",
      color: "green",
    },
    {
      id: "2",
      name: "Editor de Código",
      description: "Compartilhe e edite código com o grupo",
      icon: "code",
      color: "blue",
    },
    {
      id: "3",
      name: "Editor de Fórmulas",
      description: "Crie e compartilhe fórmulas matemáticas",
      icon: "formula",
      color: "purple",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="w-full h-full bg-white dark:bg-[#0f1525] text-gray-900 dark:text-white p-0 overflow-hidden flex flex-col">
      {/* Fixed Header with Cover Image */}
      <GroupDetailHeader group={group} onBack={onBack} />

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#0f1525] p-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Buscar no grupo..."
            className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setSearchQuery("")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          )}
        </form>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1525] flex-shrink-0 shadow-sm">
        <TabsList className="bg-transparent border-b-0 p-0">
          <div className="flex px-4">
            <TabsTrigger
              value="discussoes"
              className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setActiveTab("discussoes")}
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Discussões
            </TabsTrigger>
            <TabsTrigger
              value="materiais"
              className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setActiveTab("materiais")}
            >
              <BookOpen className="h-4 w-4 mr-2" /> Materiais
            </TabsTrigger>
            <TabsTrigger
              value="arquivos"
              className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setActiveTab("arquivos")}
            >
              <FileText className="h-4 w-4 mr-2" /> Arquivos
            </TabsTrigger>
            <TabsTrigger
              value="membros"
              className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setActiveTab("membros")}
            >
              <Users className="h-4 w-4 mr-2" /> Membros
            </TabsTrigger>
            <TabsTrigger
              value="eventos"
              className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setActiveTab("eventos")}
            >
              <Calendar className="h-4 w-4 mr-2" /> Eventos
            </TabsTrigger>
            <TabsTrigger
              value="sobre"
              className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setActiveTab("sobre")}
            >
              <Info className="h-4 w-4 mr-2" /> Sobre
            </TabsTrigger>
            <TabsTrigger
              value="configuracoes"
              className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setActiveTab("configuracoes")}
            >
              <Settings className="h-4 w-4 mr-2" /> Configurações
            </TabsTrigger>
          </div>
        </TabsList>
      </div>

      {/* Tabs Content - Below the fixed cover */}
      <div className="flex-grow overflow-auto">
        {activeTab === "discussoes" && (
          <DiscussoesTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            groupName={group.nome || "Mecânica Quântica Avançada"}
            group={group}
          />
        )}

        {activeTab === "materiais" && <MaterialsSection />}

        {activeTab === "arquivos" && (
          <div className="p-4">
            <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Arquivos do Grupo</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Pesquisar arquivos..."
                      className="pl-10 bg-white dark:bg-[#0f1525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white w-64 rounded-full"
                    />
                  </div>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white transition-colors">
                    <FileUp className="h-4 w-4 mr-2" /> Adicionar arquivo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col">
                    <h4 className="font-bold mb-2">Massas</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Folder className="h-4 w-4 mr-2 text-[#FF6B00]" />
                        <span className="text-sm">Material de Aula</span>
                        <Badge className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                          3
                        </Badge>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Folder className="h-4 w-4 mr-2 text-[#FF6B00]" />
                        <span className="text-sm">Exercícios</span>
                        <Badge className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                          2
                        </Badge>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Folder className="h-4 w-4 mr-2 text-[#FF6B00]" />
                        <span className="text-sm">Referências</span>
                        <Badge className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                          2
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold mb-2">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                        avançado
                      </Badge>
                      <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                        teórico
                      </Badge>
                      <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                        prático
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="bg-white dark:bg-[#0f1525] p-3 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors shadow-sm hover:shadow-md"
                      >
                        <div className="p-2 bg-[#FF6B00]/10 rounded-lg mr-3">
                          <FileText className="h-6 w-6 text-[#FF6B00]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{file.name}</h4>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>{file.size}</span>
                            <span className="mx-2">•</span>
                            <span>Enviado por {file.uploadedBy}</span>
                            <span className="mx-2">•</span>
                            <span>{file.uploadedAt}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "membros" && (
          <div className="p-4">
            <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Membros do Grupo ({members.length})</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar membros..."
                      className="pl-10 bg-white dark:bg-[#0f1525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white w-64 rounded-full"
                    />
                  </div>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white transition-colors">
                    <UserPlus className="h-4 w-4 mr-2" /> Adicionar membro
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors shadow-sm hover:shadow-md"
                  >
                    <div className="relative mr-3">
                      <Avatar className="h-12 w-12 ring-1 ring-blue-500/20">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-[#0f1525]"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">{member.name}</h4>
                        {member.role === "Administrador" && (
                          <Badge className="ml-2 bg-[#FF6B00]/20 text-[#FF6B00] text-xs">
                            Administrador
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        {member.isOnline ? (
                          <span className="flex items-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {member.lastActive}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "eventos" && (
          <div className="p-4">
            <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Eventos do Grupo</h3>
                <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white transition-colors">
                  <Plus className="h-4 w-4 mr-2" /> Criar evento
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <div className="bg-white dark:bg-[#0f1525] rounded-lg p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                    <h4 className="font-bold mb-3">Março 2023</h4>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      <div className="text-xs text-gray-500">D</div>
                      <div className="text-xs text-gray-500">S</div>
                      <div className="text-xs text-gray-500">T</div>
                      <div className="text-xs text-gray-500">Q</div>
                      <div className="text-xs text-gray-500">Q</div>
                      <div className="text-xs text-gray-500">S</div>
                      <div className="text-xs text-gray-500">S</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => {
                          const isToday = day === 15;
                          const hasEvent = [15, 19].includes(day);
                          return (
                            <div
                              key={day}
                              className={`h-8 w-8 flex items-center justify-center rounded-full text-sm ${isToday ? "bg-[#FF6B00] text-white" : hasEvent ? "text-[#FF6B00] font-medium" : "text-gray-500 dark:text-gray-400"} ${hasEvent ? "cursor-pointer hover:bg-[#FF6B00]/10" : ""}`}
                            >
                              {day}
                            </div>
                          );
                        },
                      )}
                    </div>

                    <div className="mt-6">
                      <h4 className="font-bold mb-3">Próximo evento</h4>
                      <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h5 className="font-medium">Encontro do Grupo</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Discussão sobre os últimos tópicos e resolução de
                          exercícios.
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                          <span>15 de mar, 19:00-20:30</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            <Avatar className="h-6 w-6 border-2 border-white dark:border-[#1a2236]">
                              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" />
                              <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <Avatar className="h-6 w-6 border-2 border-white dark:border-[#1a2236]">
                              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" />
                              <AvatarFallback>P</AvatarFallback>
                            </Avatar>
                            <Avatar className="h-6 w-6 border-2 border-white dark:border-[#1a2236]">
                              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" />
                              <AvatarFallback>M</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex gap-1">
                            <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs">
                              Vou
                            </Badge>
                            <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                              Talvez
                            </Badge>
                            <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                              Não vou
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors shadow-sm hover:shadow-md"
                      >
                        <div className="flex">
                          <div className="mr-4 text-center">
                            <div className="bg-[#FF6B00]/10 text-[#FF6B00] font-bold text-xl rounded-t-lg px-3 py-1">
                              {event.date.split("/")[0]}
                            </div>
                            <div className="bg-gray-100 dark:bg-[#1a2236] text-gray-500 dark:text-gray-400 text-xs rounded-b-lg px-2 py-1">
                              março
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{event.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {event.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                              <Clock className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                              <span>{event.time}</span>
                              <span className="mx-2">•</span>
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex -space-x-2 mr-2">
                                  {event.participants
                                    .slice(0, 3)
                                    .map((participantId) => {
                                      const participant = members.find(
                                        (m) => m.id === participantId,
                                      );
                                      return (
                                        <Avatar
                                          key={participantId}
                                          className="h-6 w-6 border-2 border-white dark:border-[#0f1525]"
                                        >
                                          <AvatarImage
                                            src={participant?.avatar}
                                          />
                                          <AvatarFallback>
                                            {participant?.name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                      );
                                    })}
                                  {event.participants.length > 3 && (
                                    <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white dark:border-[#0f1525] flex items-center justify-center text-xs text-gray-700 dark:text-white">
                                      +{event.participants.length - 3}
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {event.participants.length} participantes
                                </span>
                              </div>
                              <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8 transition-colors">
                                Participar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sobre" && (
          <div className="p-4">
            <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-4 shadow-sm">
              <div className="flex h-[calc(100vh-200px)]">
                {/* Menu Lateral Esquerdo */}
                <div className="w-64 flex-shrink-0 pr-6">
                  <div className="bg-white dark:bg-[#0f1525] rounded-lg p-4 border border-gray-200 dark:border-gray-800 shadow-sm h-full">
                    <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">
                      Menu
                    </h3>
                    <div className="space-y-3">
                      <Button
                        variant="ghost"
                        className="w-full justify-start bg-[#FF6B00] hover:bg-[#FF8C40] text-white font-medium rounded-xl h-12"
                      >
                        <Info className="h-4 w-4 mr-3" />
                        Informações Básicas
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Conteúdo Principal - Estilo idêntico aos Ajustes */}
                <div className="flex-1">
                  <div className="bg-white dark:bg-[#0f1525] rounded-lg p-6 border border-gray-200 dark:border-gray-800 shadow-sm h-full overflow-y-auto">
                    {/* Header da Seção */}
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Informações do Grupo
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Visualize todas as informações básicas deste grupo de estudos
                      </p>
                    </div>

                    <div className="space-y-8">
                      {/* Informações Básicas do Grupo */}
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-[#FF6B00] rounded-lg">
                            <Info className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Informações Básicas
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Nome do Grupo */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Nome do Grupo
                            </label>
                            <Input
                              value={group.nome || "Mecânica Quântica Avançada"}
                              readOnly
                              className="bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 cursor-default text-gray-900 dark:text-white"
                            />
                          </div>

                          {/* Código do Grupo */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Código do Grupo
                            </label>
                            <Input
                              value={group.codigo_unico || "QUA2023"}
                              readOnly
                              className="bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 cursor-default text-gray-900 dark:text-white"
                            />
                          </div>

                          {/* Disciplina/Área */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Disciplina/Área
                            </label>
                            <Input
                              value={group.disciplina_area || "Física"}
                              readOnly
                              className="bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 cursor-default text-gray-900 dark:text-white"
                            />
                          </div>

                          {/* Tópico Específico */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              Tópico Específico
                            </label>
                            <Input
                              value={group.topico_especifico || "Mecânica Quântica"}
                              readOnly
                              className="bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 cursor-default text-gray-900 dark:text-white"
                            />
                          </div>

                          {/* Tipo de Grupo */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Tipo de Grupo
                            </label>
                            <Input
                              value={group.tipo_grupo || "estudo"}
                              readOnly
                              className="bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 cursor-default text-gray-900 dark:text-white"
                            />
                          </div>

                          {/* Visibilidade */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Visibilidade
                            </label>
                            <Input
                              value={group.is_public ? "Público" : "Privado"}
                              readOnly
                              className="bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 cursor-default text-gray-900 dark:text-white"
                            />
                          </div>

                          {/* Data de Criação */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Data de Criação
                            </label>
                            <Input
                              value={group.created_at ? new Date(group.created_at).toLocaleDateString('pt-BR') : "10/01/2023"}
                              readOnly
                              className="bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 cursor-default text-gray-900 dark:text-white"
                            />
                          </div>

                          {/* Número de Membros */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Número de Membros
                            </label>
                            <Input
                              value={`${members.length} membros`}
                              readOnly
                              className="bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 cursor-default text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Descrição do Grupo */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-[#FF6B00] rounded-lg">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Descrição do Grupo
                          </h4>
                        </div>
                        <textarea
                          value={group.descricao || "Grupo dedicado ao estudo de mecânica quântica e suas aplicações na física moderna. Discutimos desde os fundamentos até aplicações avançadas como computação quântica e criptografia quântica. Este grupo foi criado para facilitar o estudo colaborativo e o compartilhamento de recursos entre os alunos interessados em mecânica quântica."}
                          readOnly
                          rows={4}
                          className="w-full p-4 bg-gray-100 dark:bg-[#1a2236] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white cursor-default resize-none"
                        />
                      </div>

                      {/* Tags/Etiquetas */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-[#FF6B00] rounded-lg">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Tags/Etiquetas
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {(group.tags || ["quântica", "física", "avançado", "teórico", "prático"]).map(
                            (tag, index) => (
                              <Badge
                                key={index}
                                className="bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 px-4 py-2 rounded-xl"
                              >
                                {tag}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Administradores */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-[#FF6B00] rounded-lg">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Administradores
                          </h4>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-[#1a2236] border border-gray-300 dark:border-gray-700 rounded-xl">
                          <Avatar className="h-12 w-12 ring-2 ring-[#FF6B00]/30">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                            <AvatarFallback className="bg-[#FF6B00] text-white">AD</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Ana Silva</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Criador do grupo</p>
                          </div>
                        </div>
                      </div>

                      {/* Progresso do Grupo */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-[#FF6B00] rounded-lg">
                            <BarChart className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Progresso do Grupo
                          </h4>
                        </div>
                        <div className="p-6 bg-gray-100 dark:bg-[#1a2236] border border-gray-300 dark:border-gray-700 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo Concluído</span>
                            <span className="text-xl font-bold text-[#FF6B00]">{group.progresso || 68}%</span>
                          </div>
                          <Progress 
                            value={group.progresso || 68} 
                            className="h-3 mb-4"
                          />
                          <div className="flex gap-3">
                            <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border border-green-300/50 dark:border-green-600/50 px-3 py-1 rounded-lg">
                              <CheckCircle className="h-3 w-3 mr-1" /> Participação Ativa
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300/50 dark:border-blue-600/50 px-3 py-1 rounded-lg">
                              <Award className="h-3 w-3 mr-1" /> Contribuidor de Conteúdo
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "configuracoes" && (
          <AjustesTab groupId={group.id} group={group} />
        )}
      </div>

      {/* Modal de Configurações */}
      <GroupSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        group={group}
      />
    </div>
  );
};

export default GroupDetail;