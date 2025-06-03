
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  Calendar,
  BookOpen,
  Heart,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Settings,
  UserMinus,
  Eye,
  X,
} from "lucide-react";

export default function GruposEstudoView() {
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [searchQuery, setSearchQuery] = useState("");

  // Dados simulados dos grupos
  const meusGrupos = [
    {
      id: 1,
      nome: "Matemática Avançada",
      topico: "📏 Matemática",
      membros: 12,
      cor: "#3B82F6",
      codigo: "MATH123",
      ativo: true,
      ultimaAtividade: "2 horas atrás",
    },
    {
      id: 2,
      nome: "Física Quântica",
      topico: "⚡ Física",
      membros: 8,
      cor: "#F59E0B",
      codigo: "PHYS456",
      ativo: false,
      ultimaAtividade: "1 dia atrás",
    },
    {
      id: 3,
      nome: "Literatura Brasileira",
      topico: "📚 Literatura",
      membros: 15,
      cor: "#10B981",
      codigo: "LIT789",
      ativo: true,
      ultimaAtividade: "30 min atrás",
    },
  ];

  const gruposPublicos = [
    {
      id: 4,
      nome: "Química Orgânica",
      topico: "🧪 Química",
      membros: 25,
      cor: "#8B5CF6",
      codigo: "CHEM001",
      publico: true,
      descricao: "Estudo focado em reações orgânicas",
    },
    {
      id: 5,
      nome: "História do Brasil",
      topico: "📜 História",
      membros: 18,
      cor: "#F97316",
      codigo: "HIST002",
      publico: true,
      descricao: "Análise dos períodos históricos brasileiros",
    },
    {
      id: 6,
      nome: "Biologia Molecular",
      topico: "🌿 Biologia",
      membros: 30,
      cor: "#EF4444",
      codigo: "BIO003",
      publico: true,
      descricao: "Estudo das estruturas moleculares",
    },
  ];

  const topicos = [
    { nome: "📏 Matemática", cor: "#3B82F6", grupos: 45 },
    { nome: "📚 Língua Portuguesa", cor: "#10B981", grupos: 32 },
    { nome: "⚡ Física", cor: "#F59E0B", grupos: 28 },
    { nome: "🧪 Química", cor: "#8B5CF6", grupos: 23 },
    { nome: "🌿 Biologia", cor: "#EF4444", grupos: 31 },
    { nome: "📜 História", cor: "#F97316", grupos: 19 },
    { nome: "🌍 Geografia", cor: "#06B6D4", grupos: 22 },
    { nome: "🤔 Filosofia", cor: "#6366F1", grupos: 14 },
  ];

  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);

  const nextTopic = () => {
    setCurrentTopicIndex((prev) => (prev + 1) % topicos.length);
  };

  const prevTopic = () => {
    setCurrentTopicIndex((prev) => (prev - 1 + topicos.length) % topicos.length);
  };

  const getVisibleTopics = () => {
    const visibleCount = 4;
    const topics = [];
    for (let i = 0; i < visibleCount; i++) {
      topics.push(topicos[(currentTopicIndex + i) % topicos.length]);
    }
    return topics;
  };

  const filteredMeusGrupos = meusGrupos.filter(
    (grupo) =>
      grupo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grupo.topico.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGruposPublicos = gruposPublicos.filter(
    (grupo) =>
      grupo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grupo.topico.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinGroup = (groupId: number) => {
    console.log("Entrando no grupo:", groupId);
  };

  const handleLeaveGroup = (groupId: number) => {
    console.log("Saindo do grupo:", groupId);
  };

  const handleConfigGroup = (groupId: number) => {
    console.log("Configurando grupo:", groupId);
  };

  const handleViewGroup = (groupId: number) => {
    console.log("Visualizando grupo:", groupId);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-[#FF6B00] mr-2" />
          <h2 className="text-xl font-bold text-[#001427] dark:text-white">
            Grupos de Estudo
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Adicionar
          </Button>
          <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Criar Grupo
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar grupos..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Topics Carousel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tópicos em Destaque
          </h3>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevTopic}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTopic}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {getVisibleTopics().map((topico, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              style={{ borderLeft: `3px solid ${topico.cor}` }}
            >
              <div className="text-lg mb-1">{topico.nome}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {topico.grupos} grupos
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("meus-grupos")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === "meus-grupos"
                ? "bg-[#FF6B00] text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Meus Grupos
          </button>
          <button
            onClick={() => setActiveTab("todos-grupos")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === "todos-grupos"
                ? "bg-[#FF6B00] text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Todos os Grupos
          </button>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          <Filter className="h-3 w-3 mr-1" />
          Filtrar
        </Button>
      </div>

      {/* Groups Content */}
      <div className="space-y-3">
        {activeTab === "meus-grupos" && (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {filteredMeusGrupos.length} grupos encontrados
            </div>
            {filteredMeusGrupos.length > 0 ? (
              filteredMeusGrupos.map((grupo) => (
                <div
                  key={grupo.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: grupo.cor }}
                      >
                        {grupo.topico.split(" ")[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-[#001427] dark:text-white">
                          {grupo.nome}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {grupo.membros} membros
                          </span>
                          <span>Código: {grupo.codigo}</span>
                          <span className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-1 ${
                                grupo.ativo ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></div>
                            {grupo.ultimaAtividade}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewGroup(grupo.id)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConfigGroup(grupo.id)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLeaveGroup(grupo.id)}
                        className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                      >
                        <UserMinus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Nenhum grupo encontrado
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  Você ainda não participa de nenhum grupo de estudos ou sua busca
                  não retornou resultados.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "todos-grupos" && (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {filteredGruposPublicos.length} grupos disponíveis
            </div>
            {filteredGruposPublicos.length > 0 ? (
              filteredGruposPublicos.map((grupo) => (
                <div
                  key={grupo.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: grupo.cor }}
                      >
                        {grupo.topico.split(" ")[0]}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-sm text-[#001427] dark:text-white">
                            {grupo.nome}
                          </h4>
                          <Badge className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs">
                            <Star className="h-2 w-2 mr-1 fill-current" />
                            Público
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {grupo.descricao}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {grupo.membros} membros
                          </span>
                          <span>Código: {grupo.codigo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewGroup(grupo.id)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleJoinGroup(grupo.id)}
                        className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-7"
                      >
                        Participar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Nenhum grupo público encontrado
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  Não há grupos públicos disponíveis no momento ou sua busca não
                  retornou resultados.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
