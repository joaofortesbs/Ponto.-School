import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Hash } from "lucide-react";
import CreateGroupModal from "../../../turmas/CreateGroupModalEnhanced";
import EntrarGrupoPorCodigoModal from "../../../turmas/EntrarGrupoPorCodigoModal";
import { supabase } from "@/lib/supabase";
import GrupoEstudoCard from "./GrupoEstudoCard";

interface GruposEstudoInterfaceProps {
  showAllGroups?: boolean;
}

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ showAllGroups = false }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEntrarPorCodigoModalOpen, setIsEntrarPorCodigoModalOpen] = useState(false);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Aqui você pode implementar a lógica para buscar grupos do banco de dados
  // Este exemplo usa dados simulados
  useEffect(() => {
    const fetchGrupos = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('grupos_estudo').select('*');

        // Se não for para mostrar todos os grupos, filtre apenas os do usuário atual
        if (!showAllGroups) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            query = query.eq('user_id', user.id);
          }
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao buscar grupos de estudo do Supabase:", error);
          // Carregar dados do localStorage como fallback
          const gruposLocal = localStorage.getItem('grupos_estudo');
          if (gruposLocal) {
            setGrupos(JSON.parse(gruposLocal));
            console.log("Grupos recuperados do armazenamento local:", JSON.parse(gruposLocal).length);
          }
        } else if (data) {
          setGrupos(data);
          // Salvar no localStorage para acesso offline
          localStorage.setItem('grupos_estudo', JSON.stringify(data));
        }
      } catch (error) {
        console.error("Erro ao buscar grupos de estudo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrupos();
  }, [showAllGroups]);

  // Filtrar grupos com base na pesquisa
  const filteredGrupos = grupos.filter(
    (grupo) =>
      grupo.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grupo.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupCreated = (novoGrupo: any) => {
    setGrupos([...grupos, novoGrupo]);
  };

  const handleGroupJoined = (grupoJoinedData: any) => {
    // Verificar se o grupo já existe na lista
    if (!grupos.some(g => g.id === grupoJoinedData.id)) {
      setGrupos([...grupos, grupoJoinedData]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar grupos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          <Button
            onClick={() => setIsEntrarPorCodigoModalOpen(true)}
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
          >
            <Hash className="h-4 w-4" />
            Entrar com Código
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="bg-[#FF6B00] hover:bg-orange-700 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Criar Grupo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-40 w-full max-w-3xl bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ) : filteredGrupos.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900">Nenhum grupo encontrado</h3>
          <p className="text-sm text-gray-500 mt-2">
            {searchQuery
              ? "Não encontramos grupos com esses termos. Tente outra busca."
              : "Você ainda não tem grupos de estudo. Crie um novo grupo ou entre em um grupo existente com um código!"}
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Button
              onClick={() => setIsEntrarPorCodigoModalOpen(true)}
              variant="outline"
              className="flex items-center"
            >
              <Hash className="h-4 w-4 mr-2" />
              Entrar com Código
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#FF6B00] hover:bg-orange-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Grupo
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGrupos.map((grupo) => (
            <GrupoEstudoCard 
              key={grupo.id} 
              grupo={grupo} 
              onGrupoUpdated={(grupoAtualizado) => {
                setGrupos(grupos.map(g => g.id === grupoAtualizado.id ? grupoAtualizado : g));
              }}
            />
          ))}
        </div>
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      <EntrarGrupoPorCodigoModal
        isOpen={isEntrarPorCodigoModalOpen}
        onClose={() => setIsEntrarPorCodigoModalOpen(false)}
        onSuccess={handleGroupJoined}
      />
    </div>
  );
};

export default GruposEstudoInterface;