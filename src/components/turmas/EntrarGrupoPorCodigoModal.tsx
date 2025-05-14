The provided code changes focus on integrating Supabase database interaction for group code verification and retrieval within a React component, updating function signatures and adding necessary imports to facilitate this integration.
```

```replit_final_file}
import { verificarSeCodigoExiste, buscarGrupoPorCodigo } from "@/lib/grupoCodigoUtils";
import React, { useState } from 'react';

interface GrupoData {
  id: string;
  nome: string;
  descricao?: string;
  membros?: number;
  cor?: string;
  disciplina?: string;
  codigo: string;
  visibilidade?: string;
  privado?: boolean;
  dataCriacao?: string;
}

interface EntrarGrupoPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onEntrarGrupo?: (grupoData: GrupoData) => void;
  showBuscarModal?: (show: boolean) => void;
}

const EntrarGrupoPorCodigoModal: React.FC<EntrarGrupoPorCodigoModalProps> = ({ isOpen, onClose, onSuccess, onEntrarGrupo, showBuscarModal }) => {
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodigo(e.target.value);
  };

  // Verificar código e tentar entrar no grupo
  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      setError('Por favor, insira um código válido.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Buscar dados do grupo usando o código
      const { success, data, error } = await buscarGrupoPorCodigo(codigo.trim());

      if (success && data) {
        // Grupo encontrado, preparar dados para adição
        const grupoData = {
          id: data.id || data.grupo_id,
          nome: data.nome,
          descricao: data.descricao,
          membros: data.membros || 1,
          cor: data.cor || "#FF6B00",
          disciplina: data.disciplina || "Geral",
          codigo: codigo.trim(),
          visibilidade: data.visibilidade,
          privado: data.privado,
          dataCriacao: data.data_criacao || new Date().toISOString()
        };

        // Adicionar o grupo e mostrar mensagem de sucesso
        if (onEntrarGrupo) onEntrarGrupo(grupoData);
        setSuccess('Você entrou no grupo com sucesso!');

        // Fechar o modal após sucesso
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError('Código inválido ou expirado. Verifique e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      setError('Ocorreu um erro ao verificar o código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Entrar em um Grupo com Código</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}

        <input
          type="text"
          placeholder="Digite o código do grupo"
          value={codigo}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex justify-between">
          <button
            onClick={handleVerificarCodigo}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Verificar Código'}
          </button>
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
            Cancelar
          </button>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => { onClose(); if (showBuscarModal) showBuscarModal(true); }} className="text-blue-500 hover:underline">
            Buscar Grupos
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntrarGrupoPorCodigoModal;