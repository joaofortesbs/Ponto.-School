
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { gruposEstudoStorage, GrupoEstudo } from "@/lib/gruposEstudoStorage";
import GrupoEstudoCard from "./interface/GrupoEstudoCard";
import CreateGroupModal from "../CreateGroupModal";
import AdicionarGruposModal from "../modaladicionargruposviacódigo/AdicionarGruposModal";
import { EntrarGrupoPorCodigoModal } from "../EntrarGrupoPorCodigoModal";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className = "" }) => {
  const [grupos, setGrupos] = useState<GrupoEstudo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [showEntrarCodigoModal, setShowEntrarCodigoModal] = useState(false);

  useEffect(() => {
    const carregarGrupos = async () => {
      setIsLoading(true);
      try {
        const todosGrupos = await gruposEstudoStorage.obterTodosGrupos();
        setGrupos(todosGrupos);
      } catch (error) {
        console.error("Erro ao carregar grupos de estudo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarGrupos();
  }, []);

  const handleGrupoAdicionado = async () => {
    // Recarregar a lista de grupos
    const todosGrupos = await gruposEstudoStorage.obterTodosGrupos();
    setGrupos(todosGrupos);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Meus Grupos de Estudo
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAdicionarModal(true)}
            variant="outline"
            className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar Grupos
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Grupo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      ) : grupos.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Você ainda não participa de nenhum grupo de estudo
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Criar ou entrar em um grupo de estudo permite que você colabore com
            outros estudantes, compartilhe materiais e discuta tópicos de
            interesse.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => setShowEntrarCodigoModal(true)}
              variant="outline"
              className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              <Search className="h-4 w-4 mr-2" />
              Entrar com Código
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Meu Primeiro Grupo
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((grupo) => (
            <GrupoEstudoCard
              key={grupo.id}
              grupo={grupo}
              onUpdate={handleGrupoAdicionado}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onGrupoCreated={handleGrupoAdicionado}
        />
      )}

      {showAdicionarModal && (
        <AdicionarGruposModal
          isOpen={showAdicionarModal}
          onClose={() => {
            setShowAdicionarModal(false);
            handleGrupoAdicionado();
          }}
        />
      )}

      {showEntrarCodigoModal && (
        <EntrarGrupoPorCodigoModal
          isOpen={showEntrarCodigoModal}
          onClose={() => {
            setShowEntrarCodigoModal(false);
            handleGrupoAdicionado();
          }}
        />
      )}
    </div>
  );
};

export default GruposEstudoView;
