
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";
import { supabase } from "@/lib/supabase";
import { obterTodosGrupos } from "@/lib/gruposEstudoStorage";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Carregar o ID do usuário ao iniciar
  useEffect(() => {
    const carregarUsuario = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    };

    carregarUsuario();

    // Refresh a cada 5 segundos para garantir atualização do conteúdo
    const intervalId = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Forçar atualização sempre que esse componente for montado
  useEffect(() => {
    const forceRerender = () => setRefreshKey(prev => prev + 1);

    // Executar na montagem
    forceRerender();

    // Executar novamente quando o componente estiver completamente renderizado
    const timeoutId = setTimeout(forceRerender, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`w-full ${className} card-container`} style={{ 
      contain: 'content',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* A chave de atualização garante que o componente filho será remontado quando necessário */}
      <GruposEstudoInterface key={refreshKey} />
    </div>
  );
};

export default GruposEstudoView;
