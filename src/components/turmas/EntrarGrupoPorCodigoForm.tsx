import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verificarSeCodigoExiste } from '@/lib/gruposEstudoStorage';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/lib/notifications-service';

interface EntrarGrupoPorCodigoFormProps {
  onClose: () => void;
  onGrupoAdicionado?: () => void;
}

export default function EntrarGrupoPorCodigoForm({ onClose, onGrupoAdicionado }: EntrarGrupoPorCodigoFormProps) {
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [grupoInfo, setGrupoInfo] = useState<any>(null);
  const [isPrivado, setIsPrivado] = useState(false);
  const [isEnviandoSolicitacao, setIsEnviandoSolicitacao] = useState(false);
  const [jaPertenceAoGrupo, setJaPertenceAoGrupo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setGrupoInfo(null);
    setIsPrivado(false);
    setJaPertenceAoGrupo(false);

    if (!codigo.trim()) {
      setErro('Por favor, insira um código de grupo válido');
      return;
    }

    setIsLoading(true);

    try {
      // Verificar se o código existe no servidor
      const response = await fetch('/api/verificar-codigo-grupo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo }),
      });

      const data = await response.json();

      if (response.ok && data.existe) {
        // O código existe, verificar outras condições
        const { user } = await supabase.auth.getUser();

        if (!user) {
          setErro('Você precisa estar logado para entrar em um grupo');
          setIsLoading(false);
          return;
        }

        // Verificar se o grupo é privado
        if (data.privado) {
          setIsPrivado(true);
          setGrupoInfo(data.grupo);
          setIsLoading(false);
          return;
        }

        // Verificar se o usuário já pertence ao grupo
        if (data.jaPertence) {
          setJaPertenceAoGrupo(true);
          setGrupoInfo(data.grupo);
          setIsLoading(false);
          return;
        }

        // Adicionar o usuário ao grupo
        const addResponse = await fetch('/api/adicionar-usuario-ao-grupo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            codigo, 
            userId: user.id 
          }),
        });

        const addData = await addResponse.json();

        if (addResponse.ok) {
          setIsLoading(false);

          // Mostrar notificação de sucesso
          notificationService.success(
            `Você foi adicionado ao grupo "${addData.grupo.nome}" com sucesso!`,
            'Grupo adicionado'
          );

          if (onGrupoAdicionado) {
            onGrupoAdicionado();
          }
          onClose();
        } else {
          setErro(addData.mensagem || 'Erro ao adicionar você ao grupo');
          setIsLoading(false);
        }
      } else {
        // O código não existe
        setErro(data.mensagem || 'Código de grupo não encontrado');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro ao verificar código de grupo:', error);
      setErro('Erro ao verificar o código. Tente novamente.');
      setIsLoading(false);
    }
  };

  const enviarSolicitacao = async () => {
    if (!grupoInfo || !grupoInfo.id) return;

    setIsEnviandoSolicitacao(true);

    try {
      const { user } = await supabase.auth.getUser();

      if (!user) {
        setErro('Você precisa estar logado para enviar solicitações');
        setIsEnviandoSolicitacao(false);
        return;
      }

      const response = await fetch('/api/solicitar-entrada-grupo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grupoId: grupoInfo.id,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        notificationService.success(
          `Solicitação enviada com sucesso para o grupo "${grupoInfo.nome}"`,
          'Solicitação enviada'
        );
        onClose();
      } else {
        setErro(data.mensagem || 'Erro ao enviar solicitação');
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setErro('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsEnviandoSolicitacao(false);
    }
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Formatar código para maiúsculas e remover espaços
    const valorFormatado = e.target.value.toUpperCase().replace(/\s/g, '');
    setCodigo(valorFormatado);

    // Limpar erro e estados ao digitar
    if (erro) setErro(null);
    if (grupoInfo) setGrupoInfo(null);
    if (isPrivado) setIsPrivado(false);
    if (jaPertenceAoGrupo) setJaPertenceAoGrupo(false);
  };

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-4">Entrar em Grupo com Código</h2>

      {jaPertenceAoGrupo && grupoInfo ? (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <h3 className="text-amber-700 font-medium">Você já pertence ao grupo</h3>
          <p className="text-amber-600 mt-2">
            Você já é membro do grupo "{grupoInfo.nome}".
          </p>
          <div className="mt-4 flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      ) : isPrivado && grupoInfo ? (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h3 className="text-blue-700 font-medium">Grupo Privado</h3>
          <p className="text-blue-600 mt-2">
            O grupo "{grupoInfo.nome}" é privado. Você pode enviar uma solicitação para participar.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isEnviandoSolicitacao}>
              Cancelar
            </Button>
            <Button 
              onClick={enviarSolicitacao} 
              disabled={isEnviandoSolicitacao}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEnviandoSolicitacao ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="codigo" className="text-sm font-medium">
              Código do Grupo
            </label>
            <Input
              id="codigo"
              value={codigo}
              onChange={handleCodigoChange}
              placeholder="Digite o código (ex: ABC123)"
              className="w-full"
              maxLength={10}
              autoComplete="off"
            />
            {erro && <p className="text-sm text-red-500">{erro}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !codigo.trim()}>
              {isLoading ? 'Verificando...' : 'Entrar no Grupo'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}