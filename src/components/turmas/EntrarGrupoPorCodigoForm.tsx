import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verificarSeCodigoExiste } from '@/lib/gruposEstudoStorage';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/lib/notifications-service';
import { Loader2 } from 'lucide-react';

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
      // Normalizar o código (remover espaços e converter para maiúsculas)
      const codigoNormalizado = codigo.trim().toUpperCase();
      
      try {
        // Obter a sessão do usuário atual
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setErro('Você precisa estar logado para entrar em um grupo de estudos.');
          setIsLoading(false);
          return;
        }

        // Verificar se o código existe usando a função do storage
        const codigoExiste = await verificarSeCodigoExiste(codigoNormalizado);

        if (!codigoExiste) {
          setErro('Código de grupo inválido ou grupo não encontrado.');
          setIsLoading(false);
          return;
        }

        // Obter os detalhes do grupo
        const { obterGrupoPorCodigo, adicionarUsuarioAoGrupo } = await import('@/lib/gruposEstudoStorage');
        const grupo = await obterGrupoPorCodigo(codigoNormalizado);

        if (!grupo) {
          setErro('Não foi possível encontrar os detalhes do grupo.');
          setIsLoading(false);
          return;
        }

        // Verificar se o usuário já é membro
        const membrosIds = grupo.membros_ids || [];
        if (membrosIds.includes(session.user.id) || grupo.user_id === session.user.id) {
          setJaPertenceAoGrupo(true);
          setGrupoInfo(grupo);
          setIsLoading(false);
          return;
        }

        // Verificar privacidade do grupo
        if (grupo.privado || grupo.visibilidade === "Privado (apenas por convite)") {
          const convidados = grupo.convidados || [];
          if (!convidados.includes(session.user.id) && grupo.user_id !== session.user.id) {
            setIsPrivado(true);
            setGrupoInfo(grupo);
            setIsLoading(false);
            return;
          }
        }

        // Adicionar usuário ao grupo
        const sucesso = await adicionarUsuarioAoGrupo(grupo.id, codigoNormalizado);

        if (sucesso) {
          // Mostrar notificação de sucesso
          notificationService.success(
            `Você foi adicionado ao grupo "${grupo.nome}" com sucesso!`,
            'Grupo adicionado'
          );
          
          // Disparar evento para atualizar a interface
          const grupoAdicionadoEvent = new CustomEvent('grupoAdicionado', { 
            detail: { grupo }
          });
          window.dispatchEvent(grupoAdicionadoEvent);
          
          if (onGrupoAdicionado) {
            onGrupoAdicionado();
          }
          
          onClose();
        } else {
          setErro('Erro ao adicionar você ao grupo. Por favor, tente novamente.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao processar entrada no grupo:', error);
        setErro('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro ao verificar código de grupo:', error);
      setErro('Erro ao verificar o código. Tente novamente.');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const enviarSolicitacao = async () => {
    if (!grupoInfo || !grupoInfo.id) return;

    setIsEnviandoSolicitacao(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setErro('Você precisa estar logado para enviar solicitações');
        setIsEnviandoSolicitacao(false);
        return;
      }

      try {
        // Tentar usar o endpoint da API primeiro
        const response = await fetch('/api/solicitar-entrada-grupo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grupoId: grupoInfo.id,
            userId: user.id,
            codigoGrupo: codigo.trim().toUpperCase()
          }),
        });

        if (response.ok) {
          const data = await response.json();
          notificationService.success(
            `Solicitação enviada com sucesso para o grupo "${grupoInfo.nome}"`,
            'Solicitação enviada'
          );
          
          // Disparar evento para atualizar interface
          const solicitacaoEnviadaEvent = new CustomEvent('solicitacaoGrupoEnviada', {
            detail: { grupoId: grupoInfo.id, grupoNome: grupoInfo.nome }
          });
          window.dispatchEvent(solicitacaoEnviadaEvent);
          
          onClose();
          return;
        }
      } catch (apiError) {
        console.error('Erro ao usar API de solicitações:', apiError);
        // Continuar para o fallback local
      }

      // Fallback: Implementação local para quando a API não estiver disponível
      try {
        // Salvar a solicitação no localStorage como fallback
        const solicitacoesKey = 'epictus_solicitacoes_grupo';
        const solicitacoesExistentes = JSON.parse(localStorage.getItem(solicitacoesKey) || '[]');
        
        // Verificar se já existe uma solicitação para este grupo
        const jaSolicitou = solicitacoesExistentes.some(
          (s: any) => s.grupoId === grupoInfo.id && s.userId === user.id
        );
        
        if (!jaSolicitou) {
          const novaSolicitacao = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            grupoId: grupoInfo.id,
            grupoNome: grupoInfo.nome,
            userId: user.id,
            dataEnvio: new Date().toISOString(),
            status: 'pendente'
          };
          
          solicitacoesExistentes.push(novaSolicitacao);
          localStorage.setItem(solicitacoesKey, JSON.stringify(solicitacoesExistentes));
          
          notificationService.success(
            `Solicitação enviada com sucesso para o grupo "${grupoInfo.nome}"`,
            'Solicitação enviada'
          );
          
          // Disparar evento para atualizar interface
          const solicitacaoEnviadaEvent = new CustomEvent('solicitacaoGrupoEnviada', {
            detail: { grupoId: grupoInfo.id, grupoNome: grupoInfo.nome }
          });
          window.dispatchEvent(solicitacaoEnviadaEvent);
          
          onClose();
        } else {
          setErro('Você já tem uma solicitação pendente para este grupo');
        }
      } catch (localError) {
        console.error('Erro ao salvar solicitação localmente:', localError);
        setErro('Erro ao enviar solicitação. Tente novamente.');
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
            <Button type="submit" disabled={isLoading || !codigo.trim()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Entrar no Grupo'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}