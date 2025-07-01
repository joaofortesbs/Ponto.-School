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
} from "lucide-react";
import { DiscussoesTab } from "./group-detail/tabs/DiscussoesTab";
import GroupSettingsModal from "./group-detail/GroupSettingsModal";

interface GroupDetailProps {
  group: any; // Replace with proper type
  onBack: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ group, onBack }) => {
  const [activeTab, setActiveTab] = useState("discussoes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
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

  const handleSaveGroupSettings = (settings: any) => {
    console.log("Salvando configurações do grupo:", settings);
    // Aqui você implementaria a lógica para salvar as configurações no backend
    setShowGroupSettingsModal(false);
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
            <button
              className="px-4 py-3 rounded-none border-b-2 border-transparent hover:border-[#FF6B00] hover:text-[#FF6B00] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer flex items-center"
              onClick={() => setShowGroupSettingsModal(true)}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5176 9 19.41C8.69838 19.2769 8.36381 19.2372 8.03941 19.296C7.71502 19.3548 7.41568 19.5095 7.18 19.74L7.12 19.8C6.93425 19.986 6.71368 20.1335 6.47088 20.2341C6.22808 20.3348 5.96783 20.3866 5.705 20.3866C5.44217 20.3866 5.18192 20.3348 4.93912 20.2341C4.69632 20.1335 4.47575 19.986 4.29 19.8C4.10405 19.6143 3.95653 19.3937 3.85588 19.1509C3.75523 18.9081 3.70343 18.6478 3.70343 18.385C3.70343 18.1222 3.75523 17.8619 3.85588 17.6191C3.95653 17.3763 4.10405 17.1557 4.29 16.97L4.35 16.91C4.58054 16.6743 4.73519 16.375 4.794 16.0506C4.85282 15.7262 4.81312 15.3916 4.68 15.09C4.55324 14.7942 4.34276 14.542 4.07447 14.3643C3.80618 14.1866 3.49179 14.0913 3.17 14.09H3C2.46957 14.09 1.96086 13.8793 1.58579 13.5042C1.21071 13.1291 1 12.6204 1 12.09C1 11.5596 1.21071 11.0509 1.58579 10.6758C1.96086 10.3007 2.46957 10.09 3 10.09H3.09C3.42099 10.0823 3.742 9.97512 4.01062 9.78251C4.27925 9.5899 4.48167 9.32074 4.59 9.01C4.72312 8.70838 4.76282 8.37381 4.704 8.04941C4.64519 7.72502 4.49054 7.42568 4.26 7.19L4.2 7.13C4.01405 6.94425 3.86653 6.72368 3.76588 6.48088C3.66523 6.23808 3.61343 5.97783 3.61343 5.715C3.61343 5.45217 3.66523 5.19192 3.76588 4.94912C3.86653 4.70632 4.01405 4.48575 4.2 4.3C4.38575 4.11405 4.60632 3.96653 4.84912 3.86588C5.09192 3.76523 5.35217 3.71343 5.615 3.71343C5.87783 3.71343 6.13808 3.76523 6.38088 3.86588C6.62368 3.96653 6.84425 4.11405 7.03 4.3L7.09 4.36C7.32568 4.59054 7.62502 4.74519 7.94941 4.804C8.27381 4.86282 8.60838 4.82312 8.91 4.69H9C9.29577 4.56324 9.54802 4.35276 9.72569 4.08447C9.90337 3.81618 9.99872 3.50179 10 3.18V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Configurações
            </button>
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
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 mb-6 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-lg font-bold mb-3">Sobre o Grupo</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {group.descricao ||
                      "Grupo dedicado ao estudo de mecânica quântica e suas aplicações na física moderna. Discutimos desde os fundamentos até aplicações avançadas como computação quântica e criptografia quântica."}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Este grupo foi criado para facilitar o estudo colaborativo e
                    o compartilhamento de recursos entre os alunos interessados
                    em mecânica quântica.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 mb-6 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-lg font-bold mb-3">Tópicos de Estudo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="bg-gray-50 dark:bg-[#0f1525] p-3 rounded-lg border border-[#FF6B00]/30 hover:shadow-md transition-all"
                      >
                        <h4 className="font-bold text-[#FF6B00]">
                          {topic.title}
                        </h4>
                        <Button
                          variant="link"
                          className="text-xs text-[#FF6B00] p-0 h-auto"
                        >
                          Ver recursos relacionados
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">
                      Ferramentas e Recursos
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0f1525] transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="bg-gray-50 dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center hover:shadow-md transition-all"
                      >
                        <div
                          className={`h-12 w-12 rounded-full bg-${tool.color}-100 dark:bg-${tool.color}-500/20 flex items-center justify-center mb-2`}
                        >
                          {tool.icon === "whiteboard" && (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M21 2H3C2.4 2 2 2.4 2 3V17C2 17.6 2.4 18 3 18H10V20H8V22H16V20H14V18H21C21.6 18 22 17.6 22 17V3C22 2.4 21.6 2 21 2ZM20 16H4V4H20V16Z"
                                fill="#10B981"
                              />
                            </svg>
                          )}
                          {tool.icon === "code" && (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z"
                                fill="#3B82F6"
                              />
                            </svg>
                          )}
                          {tool.icon === "formula" && (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7 2H17L13.5 7H17L10 16V9H7V2ZM9 4V7H10V10.31L12 7.5H9.5L13 2.5H8V4H9ZM3 20H21V22H3V20Z"
                                fill="#8B5CF6"
                              />
                            </svg>
                          )}
                        </div>
                        <h4 className="font-bold mb-1">{tool.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {tool.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 mb-6 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-lg font-bold mb-3">Detalhes do Grupo</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Criado em
                      </p>
                      <p className="text-sm">
                        {group.dataInicio || "10/01/2023"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tipo de Grupo
                      </p>
                      <p className="text-sm">Público</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Administradores
                      </p>
                      <div className="flex items-center mt-1">
                        <Avatar className="h-6 w-6 ring-1 ring-blue-500/20">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana" />
                          <AvatarFallback>M</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Etiquetas
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(group.tags || ["avançado", "teórico", "prático"]).map(
                          (tag, index) => (
                            <Badge
                              key={index}
                              className="bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30"
                            >
                              {tag}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-lg font-bold mb-3">Progresso do Grupo</h3>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative h-32 w-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200 dark:text-gray-700 stroke-current"
                          strokeWidth="10"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        ></circle>
                        <circle
                          className="text-[#FF6B00] stroke-current"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${(group.progresso || 68) * 2.51} 251.2`}
                          strokeDashoffset="0"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          transform="rotate(-90 50 50)"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#FF6B00]">
                          {group.progresso || 68}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    O grupo completou {group.progresso || 68}% do conteúdo
                    planejado
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" /> Participação
                        Ativa
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" /> Contribuidor de
                        Conteúdo
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Configurações do Grupo */}
      {showGroupSettingsModal && (
        <GroupSettingsModal
          isOpen={showGroupSettingsModal}
          onClose={() => setShowGroupSettingsModal(false)}
          group={group}
          onSave={handleSaveGroupSettings}
        />
      )}
    </div>
  );
};

export default GroupDetail;