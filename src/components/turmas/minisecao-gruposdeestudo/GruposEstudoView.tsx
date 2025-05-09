import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Search, BookOpen, Users, Calendar, MessageCircle, Filter, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import CreateGroupModal from "../CreateGroupModal";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { getGruposEstudoByUserId, GrupoEstudoUsuario } from "@/services/databaseService";
import { gruposEstudo } from "@/components/estudos/data/gruposEstudo";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userGroups, setUserGroups] = useState<GrupoEstudoUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Função para carregar os grupos do usuário
  const carregarGruposUsuario = async () => {
    if (user && user.id) {
      setIsLoading(true);
      try {
        const grupos = await getGruposEstudoByUserId(user.id);
        setUserGroups(grupos);
      } catch (error) {
        console.error("Erro ao carregar grupos do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Carregar os grupos do usuário quando o componente montar ou o usuário mudar
  useEffect(() => {
    carregarGruposUsuario();
  }, [user]);
  
  // Filtrar os grupos com base na consulta de pesquisa
  const filteredGroups = userGroups.filter(
    (group) =>
      group.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.disciplina.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.topico.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Lista de grupos sugeridos (usando dados mock)
  const suggestedGroups = gruposEstudo.slice(0, 5);
  
  const handleCreateSuccess = () => {
    // Recarregar os grupos após criação bem-sucedida
    carregarGruposUsuario();
  };

  return (
    <div className={`w-full ${className} card-container`} style={{ 
      contain: 'content',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <div className="p-4 space-y-6">
        {/* Cabeçalho com Título e Botão de Criar */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Grupos de Estudo
          </h2>
          <div className="flex space-x-2">
            <Button 
              onClick={() => carregarGruposUsuario()}
              variant="outline"
              size="icon"
              className="h-9 w-9"
              title="Atualizar lista"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Criar Grupo
            </Button>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar grupos por nome, disciplina ou tópico..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="meus-grupos">
          <TabsList className="mb-4">
            <TabsTrigger value="meus-grupos">Meus Grupos</TabsTrigger>
            <TabsTrigger value="sugeridos">Sugeridos para Você</TabsTrigger>
          </TabsList>

          {/* Tab de Meus Grupos */}
          <TabsContent value="meus-grupos">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ) : filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={group.imagem}
                            alt={group.nome}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                            <h3 className="text-lg font-bold text-white truncate">
                              {group.nome}
                            </h3>
                            <Badge className="bg-[#FF6B00]">{group.nivel}</Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <BookOpen className="h-4 w-4 mr-1" />
                              <span className="truncate">{group.disciplina}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{group.membros}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                            {group.descricao || `Grupo de estudos sobre ${group.topico} na disciplina de ${group.disciplina}.`}
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{group.proximaReuniao || "Sem reunião agendada"}</span>
                            </div>
                            {group.progresso > 0 && (
                              <div className="flex items-center">
                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#FF6B00] rounded-full" 
                                    style={{ width: `${group.progresso}%` }}
                                  ></div>
                                </div>
                                <span className="ml-1.5">{group.progresso}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="mx-auto bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Nenhum grupo encontrado
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  {searchQuery
                    ? "Nenhum grupo corresponde à sua pesquisa. Tente termos diferentes ou crie um novo grupo."
                    : "Você ainda não criou ou se juntou a nenhum grupo de estudos. Crie seu primeiro grupo agora!"}
                </p>
                <Button
                  className="mt-4 bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Criar Grupo
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab de Grupos Sugeridos */}
          <TabsContent value="sugeridos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={group.imagem}
                          alt={group.nome}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <h3 className="text-lg font-bold text-white truncate">
                            {group.nome}
                          </h3>
                          <Badge className="bg-[#FF6B00]">{group.nivel}</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span className="truncate">{group.disciplina}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{group.membros}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                          {group.descricao || `Grupo de estudos sobre ${group.topico} na disciplina de ${group.disciplina}.`}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{group.proximaReuniao}</span>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
                            Ver detalhes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal de Criação de Grupo */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => {}}
        onCreateSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default GruposEstudoView;