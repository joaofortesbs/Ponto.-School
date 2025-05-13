import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";
import { supabase } from "@/lib/supabase";
import { obterTodosGrupos, GrupoEstudo } from "@/lib/gruposEstudoStorage";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  const [grupos, setGrupos] = useState<GrupoEstudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verificarAutenticacao = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUserId(data.session.user.id);
          carregarGrupos(data.session.user.id);
        } else {
          setLoading(false);
          setError("Você precisa estar logado para ver seus grupos de estudo.");
        }
      } catch (erro) {
        console.error("Erro ao verificar autenticação:", erro);
        setLoading(false);
        setError("Não foi possível verificar sua sessão. Tente novamente mais tarde.");
      }
    };

    verificarAutenticacao();
  }, []);

  const carregarGrupos = async (uid: string) => {
    setLoading(true);
    try {
      const todosGrupos = await obterTodosGrupos(uid);
      console.log(`Carregados ${todosGrupos.length} grupos para o usuário ${uid}`);
      setGrupos(todosGrupos);
    } catch (erro) {
      console.error("Erro ao carregar grupos:", erro);
      setError("Não foi possível carregar seus grupos de estudo. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const atualizarGrupo = (grupoAtualizado: GrupoEstudo) => {
    setGrupos(gruposAtuais => 
      gruposAtuais.map(grupo => 
        grupo.id === grupoAtualizado.id ? grupoAtualizado : grupo
      )
    );
  };

  return (
    <div 
      className={`w-full ${className} card-container`} 
      style={{ 
        contain: 'content',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6B00]"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando grupos de estudo...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="text-red-500 mb-2">⚠️ {error}</div>
          <button 
            onClick={() => userId && carregarGrupos(userId)}
            className="px-4 py-2 bg-[#FF6B00] text-white rounded-md hover:bg-[#FF8C40] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <GruposEstudoInterface 
          grupos={grupos} 
          onGrupoAtualizado={atualizarGrupo}
        />
      )}
    </div>
  );
};

export default GruposEstudoView;