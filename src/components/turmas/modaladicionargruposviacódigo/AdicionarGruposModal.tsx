
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, RefreshCw, Search, Link } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { verificarSeCodigoExiste, adicionarGrupoComCodigo } from "@/lib/grupoCodigoUtils";

interface AdicionarGruposModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdicionarGruposModal: React.FC<AdicionarGruposModalProps> = ({ isOpen, onClose }) => {
  const [codigo, setCodigo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sincronizando, setSincronizando] = useState<boolean>(false);

  useEffect(() => {
    // Limpar estado quando o modal é aberto
    if (isOpen) {
      setCodigo("");
      setError(null);
    }
  }, [isOpen]);

  // Função para verificar e criar tabelas necessárias
  const verificarCriarTabelas = async () => {
    try {
      setSincronizando(true);

      // Tentar através da API primeiro
      try {
        const response = await fetch('/api/fix-tables', {
          method: 'POST',
        });
        
        if (response.ok) {
          console.log("Tabelas verificadas/criadas com sucesso via API");
          return true;
        }
      } catch (apiError) {
        console.error("Erro ao usar API para criar tabelas:", apiError);
      }

      // Verificar se a tabela de grupos de estudo existe
      const { count: countGrupos, error: errorGrupos } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (errorGrupos && errorGrupos.code === '42P01') {
        console.log("Tabela grupos_estudo não existe. Tentando criar...");
        
        // Criar tabela grupos_estudo
        try {
          await supabase.query(`
            CREATE TABLE IF NOT EXISTS public.grupos_estudo (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL,
              nome TEXT NOT NULL,
              descricao TEXT,
              cor TEXT NOT NULL DEFAULT '#FF6B00',
              membros INTEGER NOT NULL DEFAULT 1,
              membros_ids JSONB DEFAULT '[]'::jsonb,
              topico TEXT,
              topico_nome TEXT,
              topico_icon TEXT,
              privado BOOLEAN DEFAULT false,
              visibilidade TEXT DEFAULT 'todos',
              codigo TEXT,
              disciplina TEXT DEFAULT 'Geral',
              data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          `);
          console.log("Tabela grupos_estudo criada com sucesso!");
        } catch (createError) {
          console.error("Erro ao criar tabela grupos_estudo:", createError);
          setError("Erro ao criar tabela de grupos. Por favor tente novamente.");
          return false;
        }
      }

      // Verificar se a tabela de códigos existe
      const { count: countCodigos, error: errorCodigos } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (errorCodigos && errorCodigos.code === '42P01') {
        console.log("Tabela codigos_grupos_estudo não existe. Tentando criar...");
        
        // Criar tabela codigos_grupos_estudo
        try {
          await supabase.query(`
            CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
              codigo VARCHAR(15) PRIMARY KEY,
              grupo_id UUID NOT NULL,
              nome VARCHAR NOT NULL,
              descricao TEXT,
              data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
              user_id UUID,
              privado BOOLEAN DEFAULT false,
              membros INTEGER DEFAULT 1,
              visibilidade VARCHAR,
              disciplina VARCHAR,
              cor VARCHAR DEFAULT '#FF6B00',
              membros_ids JSONB DEFAULT '[]'::jsonb,
              ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          `);
          console.log("Tabela codigos_grupos_estudo criada com sucesso!");
        } catch (createError) {
          console.error("Erro ao criar tabela codigos_grupos_estudo:", createError);
          setError("Erro ao criar tabela de códigos. Por favor tente novamente.");
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao verificar/criar tabelas:", error);
      setError("Erro ao verificar estrutura do banco de dados.");
      return false;
    } finally {
      setSincronizando(false);
    }
  };

  const handleSincronizar = async () => {
    await verificarCriarTabelas();
  };

  const handleEntrarGrupo = async () => {
    if (!codigo.trim()) {
      setError("Por favor, digite um código de convite");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar se as tabelas existem
      const tabelasOk = await verificarCriarTabelas();
      if (!tabelasOk) {
        setError("Erro ao verificar/criar tabelas. Por favor, tente novamente.");
        return;
      }
      
      // Verificar se o código existe e adicionar o usuário ao grupo
      const { success, error: codigoError, message } = await verificarSeCodigoExiste(codigo);
      
      if (success) {
        const resultado = await adicionarGrupoComCodigo(codigo);
        if (resultado.success) {
          // Grupo adicionado com sucesso
          onClose();
          // Mostrar notificação ou feedback
          mostrarNotificacaoSucesso("Você entrou no grupo com sucesso!");
        } else {
          setError(resultado.message || "Erro ao entrar no grupo");
        }
      } else {
        setError(message || "Código inválido ou expirado");
      }
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      setError("Ocorreu um erro ao processar sua solicitação");
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para mostrar notificação de sucesso
  const mostrarNotificacaoSucesso = (mensagem: string) => {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.top = '20px';
    element.style.left = '50%';
    element.style.transform = 'translateX(-50%)';
    element.style.padding = '10px 20px';
    element.style.background = '#4CAF50';
    element.style.color = 'white';
    element.style.borderRadius = '4px';
    element.style.zIndex = '9999';
    element.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    element.textContent = mensagem;
    document.body.appendChild(element);

    // Remover após 3 segundos
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        document.body.removeChild(element);
      }, 500);
    }, 3000);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-xl border border-white/10 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-tr from-[#FF6B00] to-[#FF8C40] rounded-full flex items-center justify-center mr-3">
              <Link className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Adicionar Grupos de Estudo</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4 text-white/80" />
          </Button>
        </div>

        {/* Botão para sincronizar */}
        <div className="flex justify-end mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSincronizar}
            disabled={sincronizando}
            className="text-xs flex items-center gap-1 border-white/10 bg-transparent text-white/70 hover:bg-white/5"
          >
            {sincronizando ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Sincronizar
          </Button>
        </div>

        {/* Search input */}
        <div className="relative w-full mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            placeholder="Pesquisar Grupos"
            className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/50 h-10"
            disabled
          />
        </div>

        {/* Convite box */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-white/10 p-4 mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.3615 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.339 1.84.574 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Código de Convite</h3>
              <p className="text-sm text-white/60">
                Entre em grupos privados utilizando um código de convite. Estes códigos são compartilhados por administradores ou membros dos grupos para acesso exclusivo.
              </p>
            </div>
          </div>
        </div>

        {/* Código input */}
        <div className="mb-2">
          <label htmlFor="codigo" className="block text-sm font-medium text-[#FF6B00] mb-1">
            # Digite o código de convite
          </label>
          <Input
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex: ABCD-1234-XYZ9"
            className="bg-black/30 border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
            <X className="h-5 w-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Button */}
        <Button
          onClick={handleEntrarGrupo}
          disabled={loading || !codigo.trim()}
          className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:opacity-90 text-white flex items-center justify-center gap-2 mt-3"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Link className="h-4 w-4" />
              Entrar com Código
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdicionarGruposModal;
