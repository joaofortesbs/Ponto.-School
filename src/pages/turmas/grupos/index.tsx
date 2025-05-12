import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users2,
  Search,
  Plus,
  Filter,
  Calendar,
  MessageCircle,
  Star,
} from "lucide-react";
import CreateGroupModal from "@/components/turmas/CreateGroupModal";
import CreateGroupModalEnhanced from "@/components/turmas/CreateGroupModalEnhanced";
import AdicionarGrupoPorCodigoModal from "@/components/turmas/AdicionarGrupoPorCodigoModal";

export default function GruposEstudo() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCodigoModalOpen, setIsCodigoModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("meus-grupos");

  // Simulated study groups data
  const studyGroups = [
    {
      id: "g1",
      name: "Matemática",
      members: ["Ana", "Pedro", "Você"],
      memberCount: 3,
      nextMeeting: "16/03, 18:00",
      course: "Física Quântica",
      hasNewMessages: true,
      activityLevel: "alta",
      isPopular: true,
      coverImage:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    },
    {
      id: "g2",
      name: "Preparação para o Projeto Final",
      members: ["Mariana", "João", "Carla", "Você"],
      memberCount: 4,
      nextMeeting: "23/03, 19:00",
      course: "Física Quântica",
      hasNewMessages: true,
      activityLevel: "alta",
      isPopular: false,
      coverImage:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    },
    {
      id: "g3",
      name: "Grupo de Cálculo Avançado",
      members: ["Roberto", "Luiza", "Você"],
      memberCount: 3,
      nextMeeting: "18/03, 17:30",
      course: "Cálculo Avançado",
      hasNewMessages: false,
      activityLevel: "média",
      isPopular: false,
      coverImage:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    },
  ];

  // Simulated recommended groups
  const recommendedGroups = [
    {
      id: "rg1",
      name: "Grupo de Química Orgânica",
      memberCount: 8,
      course: "Química Orgânica",
      matchScore: 95,
      isPopular: true,
      coverImage:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
    },
    {
      id: "rg2",
      name: "Biologia Molecular Avançada",
      memberCount: 5,
      course: "Biologia Molecular",
      matchScore: 87,
      isPopular: true,
      coverImage:
        "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&q=80",
    },
    {
      id: "rg3",
      name: "Programação em Python",
      memberCount: 12,
      course: "Ciência da Computação",
      matchScore: 82,
      isPopular: true,
      coverImage:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    },
    {
      id: "rg4",
      name: "Anatomia Humana",
      memberCount: 7,
      course: "Medicina",
      matchScore: 78,
      isPopular: false,
      coverImage:
        "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&q=80",
    },
  ];

  // Filter groups based on search query
  const filteredMyGroups = studyGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRecommendedGroups = recommendedGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateGroup = (formData: any) => {
    console.log("Dados do formulário:", formData);

    // Check if we need to show the código modal
    if (formData.showAdicionarPorCodigo) {
      console.log("Abrindo modal para adicionar grupo por código");
      
      if (formData.closeCurrentModal) {
        setIsCreateModalOpen(false);
      }
      
      // Aumentar timeout para garantir que o modal anterior seja completamente fechado
      // antes de abrir o novo, evitando problemas de animação
      setTimeout(() => {
        console.log("Abrindo modal de código após timeout");
        setIsCodigoModalOpen(true);
      }, 200);
      return;
    }

    // Normal group creation logic
    console.log("Grupo criado com sucesso:", formData);
    setIsCreateModalOpen(false);
  };

  const getActivityBadge = (level: string) => {
    switch (level) {
      case "alta":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Atividade Alta
          </Badge>
        );
      case "média":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Atividade Média
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            Atividade Baixa
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Users2 className="h-8 w-8 text-[#FF6B00] mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-[#001427] dark:text-white">
              Grupos de Estudo
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Colabore, compartilhe e aprenda com seus colegas
            </p>
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar grupos..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Novo Grupo</span>
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="meus-grupos"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="meus-grupos"
              className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
            >
              Meus Grupos
            </TabsTrigger>
            <TabsTrigger
              value="recomendados"
              className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
            >
              Recomendados
            </TabsTrigger>
            <TabsTrigger
              value="populares"
              className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
            >
              Populares
            </TabsTrigger>
            <TabsTrigger
              value="recentes"
              className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
            >
              Atividades Recentes
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            <span>Filtrar</span>
          </Button>
        </div>

        <TabsContent value="meus-grupos" className="mt-0">
          {filteredMyGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMyGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/turmas/grupos/${group.id}`)}
                >
                  <div className="h-32 bg-gray-200 relative">
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                    {group.isPopular && (
                      <Badge className="absolute top-2 left-2 bg-[#FF6B00] hover:bg-[#FF8C40]">
                        <Star className="h-3 w-3 mr-1 fill-current" /> Popular
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-[#001427] dark:text-white">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {group.course}
                    </p>

                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 border-2 border-white">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" />
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6 -ml-2 border-2 border-white">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" />
                          <AvatarFallback>P</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500 ml-1">
                          {group.memberCount} membros
                        </span>
                      </div>
                      {getActivityBadge(group.activityLevel)}
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{group.nextMeeting}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {group.hasNewMessages ? (
                          <span className="text-[#FF6B00] font-medium">
                            Novas mensagens
                          </span>
                        ) : (
                          <span>Sem novas mensagens</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Nenhum grupo encontrado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2 mb-4">
                Você ainda não participa de nenhum grupo de estudos ou sua busca
                não retornou resultados.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
              >
                Criar Novo Grupo
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recomendados" className="mt-0">
          {filteredRecommendedGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecommendedGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/turmas/grupos/${group.id}`)}
                >
                  <div className="h-32 bg-gray-200 relative">
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                    {group.isPopular && (
                      <Badge className="absolute top-2 left-2 bg-[#FF6B00] hover:bg-[#FF8C40]">
                        <Star className="h-3 w-3 mr-1 fill-current" /> Popular
                      </Badge>
                    )}
                    <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                      {group.matchScore}% Match
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-[#001427] dark:text-white">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {group.course}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users2 className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {group.memberCount} membros
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8"
                      >
                        Participar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Nenhum grupo recomendado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                Não encontramos grupos recomendados para você no momento ou sua
                busca não retornou resultados.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="populares" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...studyGroups, ...recommendedGroups]
              .filter((group) => "isPopular" in group && group.isPopular)
              .filter(
                (group) =>
                  group.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  ("course" in group &&
                    group.course
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())),
              )
              .map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/turmas/grupos/${group.id}`)}
                >
                  <div className="h-32 bg-gray-200 relative">
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-[#FF6B00] hover:bg-[#FF8C40]">
                      <Star className="h-3 w-3 mr-1 fill-current" /> Popular
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-[#001427] dark:text-white">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {"course" in group ? group.course : ""}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users2 className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {"memberCount" in group ? group.memberCount : 0}{" "}
                          membros
                        </span>
                      </div>
                      {"activityLevel" in group ? (
                        getActivityBadge(group.activityLevel)
                      ) : (
                        <Button
                          size="sm"
                          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8"
                        >
                          Participar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recentes" className="mt-0">
          <div className="space-y-4">
            {studyGroups
              .filter((group) => group.hasNewMessages)
              .filter(
                (group) =>
                  group.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  group.course
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
              )
              .map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer p-4"
                  onClick={() => navigate(`/turmas/grupos/${group.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={group.coverImage}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-[#001427] dark:text-white">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {group.course}
                      </p>

                      <div className="flex items-center mt-2 text-xs text-[#FF6B00]">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        <span>Novas mensagens</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      <span>{group.nextMeeting}</span>
                    </div>
                  </div>
                </div>
              ))}

            {studyGroups.filter((group) => group.hasNewMessages).length ===
              0 && (
              <div className="text-center py-10">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Nenhuma atividade recente
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  Não há novas mensagens ou atividades nos seus grupos de
                  estudo.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateGroupModalEnhanced
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
      
      <AdicionarGrupoPorCodigoModal
        isOpen={isCodigoModalOpen}
        onClose={() => setIsCodigoModalOpen(false)}
      />
    </div>
  );
}