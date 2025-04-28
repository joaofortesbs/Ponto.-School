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
  ChevronRight, FolderPlus, AlertCircle, RefreshCw, X
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
  apostila_pastas?: {
    nome: string;
    cor?: string;
  } | null;
}

interface Pasta {
  id: string;
  nome: string;
  cor: string;
}

interface ApostilaInteligenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApostilaInteligenteModal: React.FC<ApostilaInteligenteModalProps> = ({
  open,
  onOpenChange
}) => {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [pastaSelecionada, setPastaSelecionada] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (open) {
      carregarAnotacoesComRetry();
      carregarPastas();

      // Configurar Realtime para atualizações automáticas
      const channel = configurarRealtimeApostila();

      // Limpar listener ao fechar o modal
      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    }
  }, [open]);

  const configurarRealtimeApostila = () => {
    try {
      const channel = supabase
        .channel('apostila_anotacoes_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'apostila_anotacoes',
          },
          async (payload) => {
            console.log('Nova anotação adicionada:', payload.new);

            // Buscar detalhes da pasta associada, se houver
            if (payload.new.pasta_id) {
              const { data: pasta, error } = await supabase
                .from('apostila_pastas')
                .select('nome, cor')
                .eq('id', payload.new.pasta_id)
                .single();

              if (!error && pasta) {
                const novaAnotacao = { 
                  ...payload.new, 
                  apostila_pastas: pasta 
                } as Anotacao;

                // Adicionar a nova anotação ao estado
                setAnotacoes(prev => [novaAnotacao, ...prev]);

                // Notificar o usuário
                toast({
                  title: "Nova anotação adicionada!",
                  description: `"${novaAnotacao.titulo}" foi adicionada à sua Apostila Inteligente.`,
                  duration: 3000,
                });
              }
            } else {
              // Adicionar a nova anotação sem pasta
              const novaAnotacao = { 
                ...payload.new, 
                apostila_pastas: null 
              } as Anotacao;

              setAnotacoes(prev => [novaAnotacao, ...prev]);
            }
          }
        )
        .subscribe();

      return channel;
    } catch (err) {
      console.error('Erro ao configurar Realtime:', err);
      return null;
    }
  };

  // Função para tentar carregar anotações com retry automático
  const carregarAnotacoesComRetry = async (maxRetries = 3) => {
    setIsLoading(true);
    setError(null);

    for (let tentativa = 0; tentativa <= maxRetries; tentativa++) {
      try {
        const resultado = await carregarAnotacoes();
        if (resultado) {
          // Sucesso na carga, resetar contador de tentativas
          setRetryCount(0);
          return;
        }

        // Se chegou aqui, houve um problema
        if (tentativa < maxRetries) {
          // Aguardar antes de tentar novamente (backoff exponencial)
          const espera = Math.pow(2, tentativa) * 1000;
          await new Promise(resolve => setTimeout(resolve, espera));
          console.log(`Tentativa ${tentativa + 1} de ${maxRetries} falhou, tentando novamente...`);
        }
      } catch (error) {
        console.error(`Erro na tentativa ${tentativa + 1}:`, error);
        if (tentativa >= maxRetries) {
          setError('Erro ao carregar anotações. Não foi possível carregar suas anotações. Tente novamente.');
          setIsLoading(false);
          setRetryCount(tentativa + 1);
        }
      }
    }

    setIsLoading(false);
  };

  const carregarAnotacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('apostila_anotacoes')
        .select(`
          *,
          apostila_pastas (
            nome,
            cor
          )
        `)
        .order('data_exportacao', { ascending: false });

      if (error) {
        console.error('Erro ao carregar anotações:', error);
        if (error.code === 'PGRST116') {
          setError('Nenhuma anotação encontrada. Exporte anotações do Caderno para começar.');
        } else if (error.code === '42501') {
          setError('Permissão negada. Verifique suas credenciais e tente novamente.');
        } else {
          setError(`Erro ao carregar anotações: ${error.message}`);
        }
        return false;
      }

      if (!data || data.length === 0) {
        setError('Nenhuma anotação encontrada. Exporte anotações do Caderno para começar.');
        setAnotacoes([]);
        return true;
      }

      setAnotacoes(data);
      return true;
    } catch (err) {
      console.error('Erro ao carregar anotações:', err);
      setError('Erro inesperado ao carregar anotações. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const carregarPastas = async () => {
    try {
      const { data, error } = await supabase
        .from('apostila_pastas')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar pastas:', error);
        toast({
          title: "Erro ao carregar pastas",
          description: "Não foi possível carregar suas pastas. Algumas funcionalidades podem estar limitadas.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      setPastas(data || []);
    } catch (err) {
      console.error('Erro ao carregar pastas:', err);
    }
  };

  // Função auxiliar para verificar se uma anotação é nova (menos de 24h)
  const isNewAnotacao = (dataExportacao: string) => {
    const now = new Date();
    const exportDate = new Date(dataExportacao);
    const diffHours = (now.getTime() - exportDate.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const anotacoesFiltradas = anotacoes.filter(anotacao => {
    const matchesPasta = pastaSelecionada ? anotacao.pasta_id === pastaSelecionada : true;
    const matchesSearch = anotacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anotacao.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (anotacao.tags && anotacao.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesPasta && matchesSearch;
  });

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    carregarAnotacoesComRetry();
  };

  const handleCriarPasta = async () => {
    const nomePasta = prompt("Nome da nova pasta:");
    if (!nomePasta) return;

    const corPasta = [
      "#42C5F5", "#F5C542", "#4CAF50", "#F44336", 
      "#9C27B0", "#FF9800", "#607D8B", "#E91E63"
    ][Math.floor(Math.random() * 8)];

    try {
      const { data, error } = await supabase
        .from('apostila_pastas')
        .insert([
          { nome: nomePasta, cor: corPasta }
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
              {isLoading ? (
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
                          <h3 className="font-medium text-white">{anotacao.titulo}</h3>
                          {isNewAnotacao(anotacao.data_exportacao) && (
                            <span className="ml-2 bg-green-500/20 text-green-300 text-xs px-1.5 py-0.5 rounded-sm font-medium">
                              Novo!
                            </span>
                          )}
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
                              backgroundColor: anotacao.apostila_pastas.cor || '#42C5F5' 
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