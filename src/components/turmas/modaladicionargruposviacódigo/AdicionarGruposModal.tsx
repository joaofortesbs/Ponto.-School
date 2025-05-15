import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, User, UserPlus, Check, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { verificarRelacaoUsuarioComGrupo, sincronizarCodigosGrupos } from '@/lib/grupoCodigoUtils';

interface AdicionarGruposModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrupoAdicionado?: (grupo?: any) => void;
  userId?: string;
}

const AdicionarGruposModal: React.FC<AdicionarGruposModalProps> = ({ 
  isOpen, 
  onClose, 
  userId,
  onGrupoAdicionado 
}) => {
  const open = isOpen;
  const onOpenChange = (open: boolean) => {
    if (!open) onClose();
  };
  const [activeTab, setActiveTab] = useState('pesquisar');
  const [searchTerm, setSearchTerm] = useState('');
  const [codigoGrupo, setCodigoGrupo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [sincronizando, setSincronizando] = useState(false);

  // Get userId from local storage, because userId from props is not reliable
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('epictus_user_id');
    if (storedUserId) {
      setCurrentUserId(storedUserId);
    }
  }, []);

  const handleClose = () => {
    onOpenChange(false);
  };

  // Limpar erros/mensagens quando troca de tab
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, [activeTab]);

  // Processar adição de um grupo por código
  const processarEntradaGrupo = async () => {
    if (!codigoGrupo) {
      setErrorMessage('Por favor, digite um código');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Verificar a relação do usuário com o grupo
      const relacao = await verificarRelacaoUsuarioComGrupo(codigoGrupo, userId);

      if (!relacao.grupoId) {
        setErrorMessage('Código de grupo não encontrado. Verifique e tente novamente.');
        setIsLoading(false);
        return;
      }

      if (relacao.pertenceAoUsuario) {
        setSuccessMessage(`Você já é o criador deste grupo: ${relacao.nomeGrupo}`);
        setIsLoading(false);
        return;
      }

      if (relacao.jaEMembro) {
        setSuccessMessage(`Você já faz parte deste grupo: ${relacao.nomeGrupo}`);
        setIsLoading(false);
        return;
      }

      // Adicionar usuário ao grupo
      const { data: grupo, error: getGrupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', relacao.grupoId)
        .single();

      if (getGrupoError) {
        console.error('Erro ao buscar grupo:', getGrupoError);
        setErrorMessage('Erro ao buscar informações do grupo. Por favor, tente novamente.');
        setIsLoading(false);
        return;
      }

      // Atualizar lista de membros
      const membrosIds = Array.isArray(grupo.membros_ids) ? grupo.membros_ids : [];

      if (currentUserId && !membrosIds.includes(currentUserId)) {
        membrosIds.push(currentUserId);
      }

      // Atualizar grupo
      const { error: updateError } = await supabase
        .from('grupos_estudo')
        .update({ 
          membros_ids: membrosIds,
          membros: membrosIds.length 
        })
        .eq('id', relacao.grupoId);

      if (updateError) {
        console.error('Erro ao atualizar grupo:', updateError);
        setErrorMessage('Não foi possível entrar no grupo. Tente novamente mais tarde.');
        setIsLoading(false);
        return;
      }

      // Sucesso! Salvar no localStorage também
      try {
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');

        const grupoAtualizado = {
          ...grupo,
          membros_ids: membrosIds,
          membros: membrosIds.length
        };

        // Verificar se o grupo já existe no storage
        const grupoIndex = grupos.findIndex((g: any) => g.id === relacao.grupoId);

        if (grupoIndex >= 0) {
          // Atualizar
          grupos[grupoIndex] = grupoAtualizado;
        } else {
          // Adicionar
          grupos.push(grupoAtualizado);
        }

        localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
      } catch (storageError) {
        console.warn('Aviso: Erro ao salvar grupo no localStorage:', storageError);
      }

      setSuccessMessage(`Você entrou com sucesso no grupo: ${grupo.nome}`);
      setCodigoGrupo('');

      // Callback
      if (onGrupoAdicionado) {
        onGrupoAdicionado();
      }

    } catch (error) {
      console.error('Erro ao processar entrada no grupo:', error);
      setErrorMessage('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar grupos por termo de pesquisa
  const buscarGrupos = async () => {
    if (!searchTerm) {
      setResultados([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Primeiro verificar se é um código exato
      if (searchTerm.includes('-') || searchTerm.length >= 4) {
        const { data: grupoPorCodigo, error: codigoError } = await supabase
          .from('grupos_estudo')
          .select('*')
          .eq('codigo', searchTerm.toUpperCase())
          .maybeSingle();

        if (!codigoError && grupoPorCodigo) {
          setResultados([grupoPorCodigo]);
          setIsLoading(false);
          return;
        }
      }

      // Busca geral por termo
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,disciplina.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`)
        .order('data_criacao', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar grupos:', error);
        setErrorMessage('Erro ao buscar grupos. Por favor, tente novamente.');
        setResultados([]);
      } else {
        setResultados(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      setErrorMessage('Ocorreu um erro ao buscar grupos. Tente novamente.');
      setResultados([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Entrar em um grupo pelo resultado da pesquisa
  const entrarEmGrupo = async (grupo: any) => {
    if (!grupo || !grupo.id) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Verificar relação
      const relacao = await verificarRelacaoUsuarioComGrupo(grupo.codigo, userId);

      if (relacao.pertenceAoUsuario) {
        setSuccessMessage(`Você já é o criador deste grupo: ${grupo.nome}`);
        setIsLoading(false);
        return;
      }

      if (relacao.jaEMembro) {
        setSuccessMessage(`Você já faz parte deste grupo: ${grupo.nome}`);
        setIsLoading(false);
        return;
      }

      // Atualizar membros
      const membrosIds = Array.isArray(grupo.membros_ids) ? grupo.membros_ids : [];

      if (currentUserId && !membrosIds.includes(currentUserId)) {
        membrosIds.push(currentUserId);
      }

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('grupos_estudo')
        .update({ 
          membros_ids: membrosIds,
          membros: membrosIds.length 
        })
        .eq('id', grupo.id);

      if (updateError) {
        console.error('Erro ao atualizar grupo:', updateError);
        setErrorMessage('Não foi possível entrar no grupo. Tente novamente mais tarde.');
        setIsLoading(false);
        return;
      }

      // Atualizar no localStorage
      try {
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');

        const grupoAtualizado = {
          ...grupo,
          membros_ids: membrosIds,
          membros: membrosIds.length
        };

        const grupoIndex = grupos.findIndex((g: any) => g.id === grupo.id);

        if (grupoIndex >= 0) {
          grupos[grupoIndex] = grupoAtualizado;
        } else {
          grupos.push(grupoAtualizado);
        }

        localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
      } catch (storageError) {
        console.warn('Aviso: Erro ao salvar grupo no localStorage:', storageError);
      }

      setSuccessMessage(`Você entrou com sucesso no grupo: ${grupo.nome}`);

      // Callback
      if (onGrupoAdicionado) {
        onGrupoAdicionado();
      }

    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      setErrorMessage('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar códigos de grupos
  const sincronizarGruposECodigos = async () => {
    setSincronizando(true);
    setErrorMessage('');
    setSuccessMessage('Iniciando sincronização...');

    try {
      // Verificar tabelas
      try {
        const { error: checkError } = await supabase
          .from('grupos_estudo')
          .select('id')
          .limit(1);

        if (checkError) {
          console.error("Erro ao verificar tabela grupos_estudo:", checkError);
          setErrorMessage("Erro ao verificar tabela grupos_estudo. Execute o workflow 'Corrigir Tabelas de Grupos'.");
          setSincronizando(false);
          return;
        }

        const { error: checkCodigosError } = await supabase
          .from('codigos_grupos_estudo')
          .select('codigo')
          .limit(1);

        if (checkCodigosError && checkCodigosError.code === '42P01') {
          setErrorMessage("Erro ao verificar/criar tabela codigos_grupos_estudo. Execute o workflow 'Corrigir Tabelas de Grupos'.");
          setSincronizando(false);
          return;
        }
      } catch (checkError) {
        console.error("Erro ao verificar tabelas:", checkError);
        setErrorMessage(`Erro ao verificar estrutura das tabelas: ${checkError instanceof Error ? checkError.message : 'Erro desconhecido'}`);
        setSincronizando(false);
        return;
      }

      // Executar sincronização
      const resultado = await sincronizarCodigosGrupos();

      if (!resultado.success) {
        setErrorMessage(`Houve erros durante a sincronização. Sucessos: ${resultado.sucessos}, Erros: ${resultado.erros}`);
      } else {
        setSuccessMessage(`Sincronização concluída! Total: ${resultado.total} | Sincronizados: ${resultado.sucessos} | Ignorados: ${resultado.ignorados}`);
      }

      // Se estamos na aba de pesquisa e tem um termo, atualizar os resultados
      if (activeTab === 'pesquisar' && searchTerm) {
        await buscarGrupos();
      }
    } catch (error) {
      console.error("Erro na sincronização:", error);
      setErrorMessage(`Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSincronizando(false);
    }
  };

  // Função para entrar em um grupo via código
  const entrarGrupoPorCodigo = async () => {
    if (!codigoGrupo.trim()) {
      setErrorMessage('Por favor, digite um código de grupo válido.');
      return;
    }

    if (!currentUserId) {
      setErrorMessage('Erro de autenticação. Tente novamente mais tarde.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const codigoFormatado = codigoGrupo.trim().toUpperCase();

      // Primeiro verificar se o usuário já tem relação com este grupo
      const relacao = await verificarRelacaoUsuarioComGrupo(codigoFormatado, currentUserId);

      if (relacao.pertenceAoUsuario) {
        setErrorMessage('Você é o criador deste grupo.');
        setIsLoading(false);
        return;
      }

      if (relacao.jaEMembro) {
        setErrorMessage('Você já é membro deste grupo.');
        setIsLoading(false);
        return;
      }

      // Adicionar usuário ao grupo diretamente com uma única chamada
      const { success, message, grupo: grupoAtualizado } = 
        await adicionarUsuarioAoGrupoPorCodigo(codigoFormatado, currentUserId);

      if (!success) {
        setErrorMessage(message || 'Erro ao entrar no grupo.');
        setIsLoading(false);
        return;
      }

      // Adicionar ao localStorage para backup
      try {
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');

        // Verificar se o grupo já existe no localStorage
        const grupoExistente = grupos.findIndex((g: any) => g.id === grupoAtualizado.id);

        if (grupoExistente >= 0) {
          grupos[grupoExistente] = grupoAtualizado;
        } else {
          grupos.push(grupoAtualizado);
        }

        localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
      } catch (storageError) {
        console.warn('Aviso: Erro ao salvar grupo no localStorage:', storageError);
      }

      setSuccessMessage(message || 'Você entrou no grupo com sucesso!');
      setCodigoGrupo('');

      // Notificar que um grupo foi adicionado
      if (onGrupoAdicionado) {
        onGrupoAdicionado(grupoAtualizado);
      }
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      setErrorMessage('Erro ao entrar no grupo. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-[#181C2E] text-white border-slate-700">
        <DialogHeader className="flex justify-between items-center flex-row">
          <div className="flex items-center">
            <User className="h-6 w-6 text-orange-500 mr-2" />
            <DialogTitle>Adicionar Grupos de Estudo</DialogTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={sincronizarGruposECodigos}
              disabled={sincronizando}
              className="text-white border-orange-500 hover:bg-orange-500/20"
            >
              {sincronizando ? (
                <>
                  <Clock className="h-4 w-4 mr-1 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                'Sincronizar'
              )}
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-white hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-slate-800 mb-4">
            <TabsTrigger value="pesquisar" className="flex-1 data-[state=active]:bg-orange-500/20">
              Pesquisar Grupos
            </TabsTrigger>
            <TabsTrigger value="codigo" className="flex-1 data-[state=active]:bg-orange-500/20">
              Código de Convite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pesquisar">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  className="flex-1 bg-slate-800 border-slate-700 text-white focus:ring-orange-500"
                  placeholder="Pesquisar Grupos"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarGrupos()}
                />
                <Button
                  onClick={buscarGrupos}
                  disabled={isLoading || !searchTerm}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Search className="h-4 w-4 mr-1" />
                  Buscar
                </Button>
              </div>

              {errorMessage && (
                <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-md flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-500/20 border border-green-500 text-white p-3 rounded-md flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  {successMessage}
                </div>
              )}

              <div className="space-y-3 mt-2">
                {resultados.length === 0 && searchTerm && !isLoading && (
                  <p className="text-center text-slate-400 py-4">
                    Nenhum grupo encontrado. Tente outro termo ou entre com um código de convite.
                  </p>
                )}

                {isLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
                  </div>
                )}

                {resultados.map((grupo) => (
                  <Card key={grupo.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 bg-orange-500/20">
                            <AvatarFallback className="text-orange-500">
                              {grupo.nome?.charAt(0) || 'G'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{grupo.nome || 'Grupo sem nome'}</h3>
                            <div className="flex items-center mt-1 text-xs text-slate-400">
                              <Badge variant="outline" className="mr-2 bg-slate-700 text-orange-400 border-orange-400">
                                {grupo.disciplina || 'Geral'}
                              </Badge>
                              {grupo.membros && (
                                <span className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {grupo.membros}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={() => entrarEmGrupo(grupo)}
                          disabled={isLoading}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Entrar
                        </Button>
                      </div>
                      {grupo.descricao && (
                        <p className="text-sm text-slate-300 mt-2">{grupo.descricao}</p>
                      )}
                      {grupo.codigo && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-orange-500/10 border-orange-500 text-orange-400">
                            Código: {grupo.codigo}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="codigo">
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 flex items-start space-x-3">
                  <div className="mt-1 bg-orange-500 rounded-full p-2">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Código de Convite</h3>
                    <p className="text-sm text-slate-300 mt-1">
                      Entre em grupos privados utilizando um código de convite. Estes códigos são compartilhados por administradores ou membros dos grupos para acesso exclusivo.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <ArrowRight className="h-4 w-4 mr-1 text-orange-500" />
                  Digite o código de convite
                </label>
                <Input
                  className="w-full bg-slate-800 border-slate-700 text-white focus:ring-orange-500"
                  placeholder="Ex: ABCD-1234-XYZ9"
                  value={codigoGrupo}
                  onChange={(e) => setCodigoGrupo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && entrarGrupoPorCodigo()}
                />

                {errorMessage && (
                  <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-md flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-500/20 border border-green-500 text-white p-3 rounded-md flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {successMessage}
                  </div>
                )}

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={entrarGrupoPorCodigo}
                  disabled={isLoading || !codigoGrupo}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Entrar com Código
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionarGruposModal;