import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, Search, Plus, Tag, CalendarDays, 
  BookOpen, Clock, Edit, Trash2, FileText,
  ChevronRight, FolderPlus, AlertCircle, RefreshCw, X, MoreHorizontal, ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import '@/styles/apostila-modal.css';

interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  tags: string[];
  data_exportacao: string;
  pasta_id: string | null;
  modelo_anotacao: string;
  user_id: string;
  apostila_pastas?: {
    id: string;
    nome: string;
    cor?: string;
  } | null;
  pasta?: { // Added for compatibility with the new query
    id: string;
    nome: string;
    cor: string;
  } | null;
}

interface Pasta {
  id: string;
  nome: string;
  cor: string;
  user_id: string;
}

interface ApostilaInteligenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void; // Added onClose prop
}

const ApostilaInteligenteModal: React.FC<ApostilaInteligenteModalProps> = ({
  open,
  onOpenChange,
  onClose
}) => {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [pastaSelecionada, setPastaSelecionada] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(false); // Added loading state
  const [filtroAtual, setFiltroAtual] = useState('todas'); // Added filter state


  useEffect(() => {
    if (open) {
      carregarAnotacoes();
    }
  }, [open]);


  // Função para verificar se uma anotação é nova (menos de 24 horas)
  const isNewAnotacao = (dataExportacao: string | null): boolean => {
    if (!dataExportacao) return false;
    const now = new Date();
    const exportDate = new Date(dataExportacao);
    const diffHours = (now.getTime() - exportDate.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  // Configurar Supabase Realtime para atualizações automáticas
  useEffect(() => {
    let subscription;

    if (open) {
      // Carregar anotações ao abrir o modal
      carregarAnotacoes();

      // Configurar escuta de mudanças em tempo real
      const channel = supabase
        .channel('apostila_changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'apostila_anotacoes',
          filter: `user_id=eq.${supabase.auth.getUser()?.data?.user?.id}`
        }, (payload) => {
          console.log('Nova anotação detectada:', payload.new);

          // Buscar informações da pasta se necessário
          const processarNovaAnotacao = async () => {
            try {
              if (payload.new.pasta_id) {
                const { data: pastaData } = await supabase
                  .from('apostila_pastas')
                  .select('id, nome, cor')
                  .eq('id', payload.new.pasta_id)
                  .single();

                const novaAnotacao = {
                  ...payload.new,
                  pasta: pastaData,
                  apostila_pastas: pastaData // Mantendo compatibilidade
                };

                // Adicionar à lista de anotações
                setAnotacoes(prev => [novaAnotacao, ...prev]);
              } else {
                // Adicionar anotação sem pasta
                setAnotacoes(prev => [
                  {
                    ...payload.new,
                    pasta: null,
                    apostila_pastas: null
                  }, 
                  ...prev
                ]);
              }

              // Notificar o usuário
              toast({
                title: "Nova anotação adicionada!",
                description: `"${payload.new.titulo}" foi adicionada à sua Apostila.`,
                duration: 3000,
              });
            } catch (error) {
              console.error('Erro ao processar nova anotação:', error);
            }
          };

          processarNovaAnotacao();
        })
        .subscribe();

      // Configurar escuta para evento personalizado (quando uma anotação é exportada)
      const handleAnotacaoAdicionada = (event) => {
        console.log('Evento de anotação adicionada detectado:', event.detail);
        // Recarregar anotações para garantir que tudo está atualizado
        carregarAnotacoes();
      };

      window.addEventListener('apostila-anotacao-adicionada', handleAnotacaoAdicionada);

      // Limpar subscrição
      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('apostila-anotacao-adicionada', handleAnotacaoAdicionada);
      };
    }
  }, [open]);

  // Carregar anotações do usuário
  const carregarAnotacoes = async (retries = 3, delayMs = 500) => {
    let tentativaAtual = 0;
    let ultimoErro = null;

    while (tentativaAtual < retries) {
      tentativaAtual++;
      try {
        setLoading(true);
        setError(null);

        const { data: user } = await supabase.auth.getUser();
        const userId = user?.user?.id;

        if (!userId) {
          throw new Error('Usuário não autenticado');
        }

        // Carregar pastas primeiro
        const { data: pastasData, error: pastasError } = await supabase
          .from('apostila_pastas')
          .select('*')
          .eq('user_id', userId)
          .order('nome');

        if (pastasError) {
          console.error('Erro ao carregar pastas:', pastasError);
          throw new Error(`Erro ao carregar pastas: ${pastasError.message}`);
        }

        setPastas(pastasData || []);
        console.log("Pastas carregadas:", pastasData?.length || 0);

        // Usar LEFT JOIN para carregar anotações
        // Isso resolve o problema do relacionamento
        const { data: anotacoesRaw, error: anotacoesError } = await supabase
          .from('apostila_anotacoes')
          .select('*, pasta:apostila_pastas(*)')
          .eq('user_id', userId)
          .order('data_exportacao', { ascending: false });

        // Se o erro específico for sobre o relacionamento, tentar uma consulta alternativa
        if (anotacoesError && anotacoesError.message.includes('relationship between')) {
          console.warn('Erro de relacionamento, tentando consulta alternativa');

          // Consulta alternativa sem junção
          const { data: anotacoesSemJoin, error: erroSemJoin } = await supabase
            .from('apostila_anotacoes')
            .select('*')
            .eq('user_id', userId)
            .order('data_exportacao', { ascending: false });

          if (erroSemJoin) {
            console.error('Erro na consulta alternativa:', erroSemJoin);
            throw new Error(`Erro ao carregar anotações: ${erroSemJoin.message}`);
          }

          // Para cada anotação com pasta_id, buscar dados da pasta separadamente
          const anotacoesProcessadas = await Promise.all(
            (anotacoesSemJoin || []).map(async (anotacao) => {
              if (anotacao.pasta_id) {
                // Buscar pasta para esta anotação
                const { data: pastaData } = await supabase
                  .from('apostila_pastas')
                  .select('id, nome, cor')
                  .eq('id', anotacao.pasta_id)
                  .eq('user_id', userId)
                  .single();

                return {
                  ...anotacao,
                  pasta: pastaData || null
                };
              }
              return {
                ...anotacao,
                pasta: null
              };
            })
          );

          console.log('Anotações carregadas (método alternativo):', anotacoesProcessadas?.length || 0);
          setAnotacoes(anotacoesProcessadas || []);
        } else if (anotacoesError) {
          console.error('Erro ao carregar anotações:', anotacoesError);
          throw new Error(`Erro ao carregar anotações: ${anotacoesError.message}`);
        } else {
          // Processar dados da consulta normal se não houve erro
          const anotacoesProcessadas = (anotacoesRaw || []).map(anotacao => ({
            ...anotacao,
            apostila_pastas: anotacao.pasta // Manter compatibilidade com o restante do código
          }));

          console.log('Anotações carregadas:', anotacoesProcessadas?.length || 0);
          setAnotacoes(anotacoesProcessadas || []);
        }

        // Selecionar todas as pastas inicialmente
        setFiltroAtual('todas');

        // Se chegou aqui, operação foi bem-sucedida
        return;
      } catch (error) {
        console.error(`Erro ao carregar dados (tentativa ${tentativaAtual}/${retries}):`, error);
        ultimoErro = error;

        // Se não for a última tentativa, esperar antes de tentar novamente
        if (tentativaAtual < retries) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } finally {
        if (tentativaAtual === retries) {
          setLoading(false);
        }
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    setError(ultimoErro?.message || 'Erro ao carregar anotações');
    setLoading(false);

    // Se não há anotações, mostrar estado vazio em vez de erro
    if (!anotacoes.length) {
      setAnotacoes([]);
    }
  };

  const carregarPastas = async () => {
    try {
      setIsLoading(true);
      // Tenta obter o ID do usuário de várias fontes
      let userId = localStorage.getItem('user_id');

      // Se não encontrar, tenta outras possíveis fontes
      if (!userId) {
        // Tenta obter do sessionStorage como fallback
        userId = sessionStorage.getItem('user_id');

        // Se ainda não encontrou, tenta buscar do localStorage com outros formatos comuns
        if (!userId) {
          // Verifica se existe alguma chave no localStorage que contenha 'user' e 'id'
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('user') || key.includes('userId') || key.includes('user_id'))) {
              const potentialId = localStorage.getItem(key);
              if (potentialId && potentialId.length > 5) {
                console.log('Encontrado possível ID alternativo:', key, potentialId);
                userId = potentialId;
                // Salva no formato correto para futuras consultas
                localStorage.setItem('user_id', userId);
                break;
              }
            }
          }
        }
      }

      // Se ainda não encontrou o ID do usuário
      if (!userId) {
        console.error('ID de usuário não encontrado em nenhum local de armazenamento');
        setError('ID de usuário não encontrado. Por favor, faça login novamente.');
        return;
      }

      console.log('Carregando pastas com ID de usuário:', userId);
      let tentativas = 0;
      let dados = null;
      let ultimoErro = null;

      while (tentativas < 3 && !dados) {
        try {
          const { data, error } = await supabase
            .from('apostila_pastas')
            .select('*')
            .eq('user_id', userId)
            .order('nome');

          if (error) {
            throw error;
          }

          dados = data;
        } catch (err: any) {
          tentativas++;
          ultimoErro = err;
          console.error(`Erro ao carregar pastas (tentativa ${tentativas}/3):`, err);
          // Aguardar antes da próxima tentativa
          await new Promise(r => setTimeout(r, 500));
        }
      }

      if (!dados) {
        console.error('Falha após todas as tentativas de carregar pastas:', ultimoErro);
        setError('Não foi possível carregar suas pastas. Algumas funcionalidades podem estar limitadas.');

        // Tentar criar uma pasta padrão se necessário
        try {
          const { data: novaPasta, error: novaPastaError } = await supabase
            .from('apostila_pastas')
            .insert([
              {
                nome: "Minhas Anotações",
                cor: "#4285F4",
                user_id: userId
              }
            ])
            .select();

          if (novaPastaError) {
            throw novaPastaError;
          }

          if (novaPasta && novaPasta.length > 0) {
            setPastas(novaPasta);
            setPastaSelecionada(novaPasta[0].id);
            console.log('Pasta padrão criada com sucesso');
          }
        } catch (err) {
          console.error('Erro ao criar pasta padrão:', err);
        }

        return;
      }

      setPastas(dados);

      // Se tiver pastas e nenhuma estiver selecionada, seleciona a primeira
      if (dados && dados.length > 0 && !pastaSelecionada) {
        setPastaSelecionada(dados[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar pastas:', err);
      setError('Ocorreu um erro ao carregar suas pastas.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para recuperar a propriedade de anotação nova 
  // (usando a função já definida acima)

  const anotacoesFiltradas = anotacoes.filter(anotacao => {
    const matchesPasta = pastaSelecionada ? anotacao.pasta_id === pastaSelecionada : true;
    const matchesSearch = anotacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anotacao.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (anotacao.tags && anotacao.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesPasta && matchesSearch;
  });

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    carregarAnotacoes();
  };

  const handleCriarPasta = async () => {
    const nomePasta = prompt("Nome da nova pasta:");
    if (!nomePasta) return;

    const corPasta = [
      "#42C5F5", "#F5C542", "#4CAF50", "#F44336", 
      "#9C27B0", "#FF9800", "#607D8B", "#E91E63"
    ][Math.floor(Math.random() * 8)];

    try {
      // Tenta obter o ID do usuário de várias fontes
      let userId = localStorage.getItem('user_id');

      // Se não encontrar, tenta outras possíveis fontes
      if (!userId) {
        // Tenta obter do sessionStorage como fallback
        userId = sessionStorage.getItem('user_id');

        // Se ainda não encontrou, tenta buscar do localStorage com outros formatos comuns
        if (!userId) {
          // Verifica se existe alguma chave no localStorage que contenha 'user' e 'id'
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('user') || key.includes('userId') || key.includes('user_id'))) {
              const potentialId = localStorage.getItem(key);
              if (potentialId && potentialId.length > 5) {
                console.log('Encontrado possível ID alternativo:', key, potentialId);
                userId = potentialId;
                // Salva no formato correto para futuras consultas
                localStorage.setItem('user_id', userId);
                break;
              }
            }
          }
        }
      }

      // Se ainda não encontrou o ID do usuário
      if (!userId) {
        console.error('ID de usuário não encontrado em nenhum local de armazenamento');
        throw new Error('ID de usuário não encontrado. Por favor, faça login novamente.');
      }

      const { data, error } = await supabase
        .from('apostila_pastas')
        .insert([
          { nome: nomePasta, cor: corPasta, user_id: userId }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar pasta:', error);
        toast({
          title: "Erro ao criar pasta",
          description: "Não foi possível criar a pasta. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Adicionar a nova pasta ao estado
      setPastas(prev => [...prev, data]);
      setPastaSelecionada(data.id);

      toast({
        title: "Pasta criada!",
        description: `A pasta "${nomePasta}" foi criada com sucesso.`,
      });
    } catch (err) {
      console.error('Erro ao criar pasta:', err);
      toast({
        title: "Erro ao criar pasta",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVerDetalhesErro = () => {
    // Exibir um modal ou toast com detalhes técnicos do erro
    // apenas para administradores ou em ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      toast({
        title: "Detalhes técnicos do erro",
        description: `Tentativas: ${retryCount}. Última resposta: ${error}`,
        duration: 10000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[600px] bg-[#0D0D0D] text-white border-gray-800 rounded-xl p-0 overflow-hidden">
        <DialogHeader className="py-4 px-5 bg-gradient-to-r from-[#0A84FF] to-[#42C5F5] flex flex-row justify-between items-center">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Apostila Inteligente
          </DialogTitle>
          <Button onClick={onClose} className="text-white bg-transparent hover:bg-gray-800 rounded-md p-1">
            <X className="h-5 w-5"/>
          </Button>
        </DialogHeader>

        <div className="flex h-[calc(100%-60px)]">
          {/* Sidebar de pastas */}
          <div className="w-[220px] border-r border-gray-800 p-3 bg-[#111111]">
            <Input 
              placeholder="Buscar anotações..."
              className="bg-[#1A1A1A] border-gray-700 mb-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<Search className="h-4 w-4 text-gray-400" />}
            />

            <div className="flex items-center justify-between mb-2 mt-4">
              <h3 className="text-sm font-medium text-gray-300">Minhas Pastas</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={handleCriarPasta}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100%-80px)] pr-2">
              <Button
                variant="ghost"
                className={`w-full justify-start mb-1 px-2 py-1.5 h-auto ${pastaSelecionada === null ? 'bg-[#1A1A1A]' : 'hover:bg-[#1A1A1A]'}`}
                onClick={() => setPastaSelecionada(null)}
              >
                <FolderOpen className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-sm">Todas as Anotações</span>
              </Button>

              {pastas.map(pasta => (
                <Button
                  key={pasta.id}
                  variant="ghost"
                  className={`w-full justify-start mb-1 px-2 py-1.5 h-auto ${pastaSelecionada === pasta.id ? 'bg-[#1A1A1A]' : 'hover:bg-[#1A1A1A]'}`}
                  onClick={() => setPastaSelecionada(pasta.id)}
                >
                  <div 
                    className="h-4 w-4 mr-2 rounded-sm" 
                    style={{ backgroundColor: pasta.cor || '#42C5F5' }}
                  />
                  <span className="text-sm truncate">{pasta.nome}</span>
                </Button>
              ))}
            </ScrollArea>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {pastaSelecionada 
                    ? pastas.find(p => p.id === pastaSelecionada)?.nome || 'Pasta Selecionada'
                    : 'Todas as Anotações'}
                </h2>
                <div className="text-sm text-gray-400">
                  {anotacoesFiltradas.length} {anotacoesFiltradas.length === 1 ? 'anotação' : 'anotações'}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="flex flex-col justify-center items-center h-full py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-t-transparent border-blue-500 rounded-full mb-4"></div>
                  <p className="text-gray-300">Carregando suas anotações...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center h-full text-center px-4 py-8">
                  <div className="bg-red-900/20 text-red-400 p-4 rounded-lg border border-red-800 mb-4 max-w-md">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
                      <span className="font-medium">Erro ao carregar anotações</span>
                    </div>
                    <p className="text-sm">{error}</p>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <Button onClick={handleRetry} className="mt-2 bg-blue-600 hover:bg-blue-700">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar novamente
                    </Button>

                    {process.env.NODE_ENV === 'development' && (
                      <Button onClick={handleVerDetalhesErro} variant="outline" className="mt-2 border-gray-700">
                        Ver detalhes
                      </Button>
                    )}
                  </div>
                </div>
              ) : anotacoesFiltradas.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center px-4 py-12">
                  <FileText className="h-12 w-12 text-gray-600 mb-3" />
                  <p className="text-gray-300 font-medium">Nenhuma anotação encontrada</p>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">
                    {searchTerm 
                      ? "Tente usar termos de busca diferentes ou remover filtros"
                      : pastaSelecionada 
                        ? "Esta pasta ainda não tem anotações. Exporte anotações do Caderno para começar."
                        : "Você ainda não tem anotações na Apostila Inteligente. Exporte anotações do Caderno para começar."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {anotacoesFiltradas.map(anotacao => (
                    <div 
                      key={anotacao.id}
                      className="bg-[#1A1A1A] rounded-lg p-4 hover:bg-[#222222] transition-colors cursor-pointer anotacao-card"
                    >
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <h3 className="font-medium text-white">
                            {anotacao.titulo}
                            {isNewAnotacao(anotacao.data_exportacao) && (
                              <span className="ml-2 bg-green-500/20 text-green-300 text-xs px-1.5 py-0.5 rounded-sm font-medium">
                                Novo!
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-white">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-white">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {anotacao.conteudo}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {anotacao.tags && anotacao.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="bg-[#252525] text-blue-300 border-blue-900/20 text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(anotacao.data_exportacao).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {anotacao.modelo_anotacao}
                        </div>
                      </div>

                      {anotacao.pasta_id && anotacao.apostila_pastas && (
                        <div 
                          className="mt-3 pt-2 border-t border-gray-800 text-xs flex items-center"
                        >
                          <div 
                            className="h-2 w-2 mr-1 rounded-full" 
                            style={{ 
                              backgroundColor: anotacao.apostila_pastas.cor || '#42C5F4' 
                            }}
                          />
                          <span className="text-gray-400">
                            Pasta: {anotacao.apostila_pastas.nome}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApostilaInteligenteModal;