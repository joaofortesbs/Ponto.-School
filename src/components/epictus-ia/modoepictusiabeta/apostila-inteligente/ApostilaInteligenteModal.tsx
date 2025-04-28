import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Search, 
  Plus, 
  FolderPlus, 
  Pencil, 
  Trash2, 
  Eye, 
  Download, 
  Share2, 
  FolderOpen, 
  X,
  Filter,
  Star,
  Clock,
  History,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  SlidersHorizontal,
  FileText,
  CheckCircle,
  ChevronDown,
  Shuffle,
  LayoutGrid,
  ListFilter,
  CalendarDays,
  Maximize2,
  Minimize2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface ApostilaInteligenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Pasta {
  id: string;
  nome: string;
  cor: string;
  contagem?: number;
  user_id?: string;
  descricao?: string;
  data_criacao?: Date;
}

interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  resumo: string;
  pastaId: string;
  data: Date;
  modelo: string;
  favorito: boolean;
  ultimaEdicao?: Date;
  tags?: string[];
  visualizacoes?: number;
  origem?: 'caderno' | 'criado_na_apostila';
  user_id?: string;
  modelo_anotacao?: string;
  data_exportacao?: Date;
}

const ApostilaInteligenteModal: React.FC<ApostilaInteligenteModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  // Estados
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [pastaSelecionada, setPastaSelecionada] = useState<string | null>(null);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar pastas e anotações do Supabase
  const carregarPastas = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'anonymous';

      const { data, error } = await supabase
        .from('apostila_pastas')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        // Converter dados do banco para o formato da interface Pasta
        const pastasFromDB = data.map(pasta => ({
          id: pasta.id,
          nome: pasta.nome,
          cor: pasta.cor || "#42C5F5", // cor padrão se não tiver
          user_id: pasta.user_id,
          descricao: pasta.descricao,
          data_criacao: new Date(pasta.data_criacao)
        }));

        setPastas(pastasFromDB);

        // Se tiver pastas, selecionar a primeira
        if (pastasFromDB.length > 0 && !pastaSelecionada) {
          setPastaSelecionada(pastasFromDB[0].id);
        }
      }

      // Se não houver pastas, criar uma pasta padrão
      else if (data && data.length === 0) {
        const { data: novaPasta, error: erroNovaPasta } = await supabase
          .from('apostila_pastas')
          .insert([
            {
              user_id: userId,
              nome: "Minhas Anotações",
              cor: "#42C5F5",
              descricao: "Pasta padrão para suas anotações"
            }
          ])
          .select()
          .single();

        if (erroNovaPasta) throw erroNovaPasta;

        if (novaPasta) {
          const pastaCriada = {
            id: novaPasta.id,
            nome: novaPasta.nome,
            cor: novaPasta.cor,
            user_id: novaPasta.user_id,
            descricao: novaPasta.descricao,
            data_criacao: new Date(novaPasta.data_criacao)
          };

          setPastas([pastaCriada]);
          setPastaSelecionada(pastaCriada.id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pastas:', error);
      toast({
        title: "Erro ao carregar pastas",
        description: "Não foi possível carregar suas pastas. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const carregarAnotacoes = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id') || 'anonymous';

      // Buscar anotações no Supabase, ordenadas pela data de criação mais recente
      const { data, error } = await supabase
        .from('apostila_anotacoes')
        .select('*')
        .eq('user_id', userId)
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log("Anotações carregadas do banco:", data.length);

        // Converter dados do banco para o formato da interface Anotacao
        const anotacoesFromDB = data.map(anotacao => {
          try {
            // Verificar se o conteúdo existe e é uma string válida
            const conteudoSeguro = typeof anotacao.conteudo === 'string' ? anotacao.conteudo : '';
            
            // Criar um resumo do conteúdo para exibição, com verificação de segurança
            const resumo = conteudoSeguro.length > 150 
              ? conteudoSeguro.substring(0, 150) + '...' 
              : conteudoSeguro;

            // Garantir que as datas são válidas
            const dataCriacao = anotacao.data_criacao ? new Date(anotacao.data_criacao) : new Date();
            const dataExportacao = anotacao.data_exportacao ? new Date(anotacao.data_exportacao) : dataCriacao;
            
            // Verificar se tags é um array, caso contrário, criar array vazio
            const tags = Array.isArray(anotacao.tags) ? anotacao.tags : [];

            return {
              id: anotacao.id,
              titulo: anotacao.titulo || "Anotação sem título",
              conteudo: conteudoSeguro,
              resumo: resumo,
              pastaId: anotacao.pasta_id || '',
              data: dataCriacao,
              modelo: anotacao.modelo_anotacao || "Estudo Completo",
              favorito: Boolean(anotacao.favorito),
              ultimaEdicao: dataExportacao,
              tags: tags,
              visualizacoes: Number(anotacao.visualizacoes) || 0,
              origem: anotacao.origem || 'criado_na_apostila',
              user_id: anotacao.user_id
            };
          } catch (itemError) {
            console.error('Erro ao processar anotação individual:', itemError, anotacao);
            // Retornar um objeto com valores padrão para não quebrar o mapeamento
            return {
              id: anotacao.id || 'erro-id',
              titulo: "Anotação com erro",
              conteudo: "Erro ao carregar conteúdo",
              resumo: "Erro ao carregar conteúdo",
              pastaId: '',
              data: new Date(),
              modelo: "Estudo Completo",
              favorito: false,
              ultimaEdicao: new Date(),
              tags: [],
              visualizacoes: 0,
              origem: 'criado_na_apostila',
              user_id: userId
            };
          }
        });

        setAnotacoes(anotacoesFromDB);
      } else {
        console.log("Nenhuma anotação encontrada para o usuário:", userId);
        setAnotacoes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
      toast({
        title: "Erro ao carregar anotações",
        description: "Não foi possível carregar suas anotações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Listener para evento de anotação adicionada de outros componentes
  useEffect(() => {
    const handleAnotacaoAdicionada = (evento: CustomEvent) => {
      console.log("Evento de anotação adicionada recebido:", evento.detail);
      if (open) {
        carregarAnotacoes();
        // Se tiver pastaId e for diferente da atual, selecionar esta pasta
        if (evento.detail?.pastaId && pastaSelecionada !== evento.detail.pastaId) {
          setPastaSelecionada(evento.detail.pastaId);
        }
      }
    };

    // Adicionar listener para o evento customizado
    window.addEventListener('apostila-anotacao-adicionada', handleAnotacaoAdicionada as EventListener);
    
    // Remover listener quando o componente for desmontado
    return () => {
      window.removeEventListener('apostila-anotacao-adicionada', handleAnotacaoAdicionada as EventListener);
    };
  }, [open, pastaSelecionada]);

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (open) {
      console.log("Modal Apostila Inteligente aberto, carregando dados...");

      // Sequência de carregamento: primeiro pastas, depois anotações
      const carregarDados = async () => {
        try {
          await carregarPastas();
          await carregarAnotacoes();
          console.log("Carregamento de dados da Apostila Inteligente concluído");
        } catch (error) {
          console.error("Erro no carregamento de dados:", error);
        }
      };

      carregarDados();

      // Configurar listeners para atualizações em tempo real
      const pastasChannel = supabase
        .channel('apostila_pastas_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'apostila_pastas' }, 
          (payload) => {
            console.log("Mudança detectada em pastas:", payload);
            carregarPastas();
          }
        )
        .subscribe();

      const anotacoesChannel = supabase
        .channel('apostila_anotacoes_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'apostila_anotacoes' }, 
          (payload) => {
            console.log("Mudança detectada em anotações:", payload);
            carregarAnotacoes();
          }
        )
        .subscribe();

      // Limpar listeners quando o modal fechar
      return () => {
        console.log("Removendo channels do Supabase");
        supabase.removeChannel(pastasChannel);
        supabase.removeChannel(anotacoesChannel);
      };
    }
  }, [open]);

  const [anotacaoSelecionada, setAnotacaoSelecionada] = useState<string | null>(null);
  const [pesquisa, setPesquisa] = useState("");
  const [criandoPasta, setCriandoPasta] = useState(false);
  const [novaPasta, setNovaPasta] = useState({ nome: "", cor: "#42C5F5" });
  const [visualMode, setVisualMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"recentes" | "az" | "favoritos">("recentes");
  const [showTagsFilter, setShowTagsFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Animação ao abrir
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Funções auxiliares
  const getAnotacoesDaPasta = () => {
    if (!pastaSelecionada) return [];

    let filteredAnotacoes = anotacoes.filter(a => a.pastaId === pastaSelecionada);

    // Aplicar pesquisa
    if (pesquisa !== "") {
      filteredAnotacoes = filteredAnotacoes.filter(a => 
        a.titulo.toLowerCase().includes(pesquisa.toLowerCase()) || 
        a.resumo.toLowerCase().includes(pesquisa.toLowerCase())
      );
    }

    // Aplicar filtro de tags
    if (selectedTags.length > 0) {
      filteredAnotacoes = filteredAnotacoes.filter(a => 
        a.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // Aplicar ordenação
    switch (sortBy) {
      case "recentes":
        return filteredAnotacoes.sort((a, b) => b.ultimaEdicao!.getTime() - a.ultimaEdicao!.getTime());
      case "az":
        return filteredAnotacoes.sort((a, b) => a.titulo.localeCompare(b.titulo));
      case "favoritos":
        return filteredAnotacoes.sort((a, b) => (b.favorito ? 1 : 0) - (a.favorito ? 1 : 0));
      default:
        return filteredAnotacoes;
    }
  };

  const getAnotacaoSelecionada = () => {
    return anotacoes.find(a => a.id === anotacaoSelecionada);
  };

  const handleCriarPasta = async () => {
    if (novaPasta.nome.trim() === "") return;

    try {
      const userId = localStorage.getItem('user_id') || 'anonymous';

      // Inserir a nova pasta no banco
      const { data, error } = await supabase
        .from('apostila_pastas')
        .insert([
          {
            user_id: userId,
            nome: novaPasta.nome,
            cor: novaPasta.cor,
            descricao: ""
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Adicionar ao estado local
      const novaPastaObj: Pasta = {
        id: data.id,
        nome: novaPasta.nome,
        cor: novaPasta.cor,
        contagem: 0,
        user_id: userId,
        data_criacao: new Date()
      };

      setPastas([...pastas, novaPastaObj]);
      setNovaPasta({ nome: "", cor: "#42C5F5" });
      setCriandoPasta(false);
      setPastaSelecionada(novaPastaObj.id);

      // Registrar atividade
      await supabase
        .from('user_activity_logs')
        .insert([
          {
            user_id: userId,
            acao: 'criou pasta',
            detalhes: `Criou pasta "${novaPasta.nome}"`
          }
        ]);

      toast({
        title: "Pasta criada!",
        description: `A pasta "${novaPasta.nome}" foi criada com sucesso.`
      });

    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      toast({
        title: "Erro ao criar pasta",
        description: "Não foi possível criar a pasta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleExcluirPasta = async (id: string) => {
    try {
      // Confirmar se existem anotações nesta pasta
      const anotacoesDaPasta = anotacoes.filter(a => a.pastaId === id);

      if (anotacoesDaPasta.length > 0) {
        const confirmar = window.confirm(
          `Esta pasta contém ${anotacoesDaPasta.length} anotação(ões). Tem certeza que deseja excluí-la?`
        );

        if (!confirmar) return;
      }

      const userId = localStorage.getItem('user_id') || 'anonymous';

      // Deletar a pasta no banco
      const { error } = await supabase
        .from('apostila_pastas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      // Atualizar o estado local
      const novasPastas = pastas.filter(p => p.id !== id);
      setPastas(novasPastas);

      if (pastaSelecionada === id) {
        setPastaSelecionada(novasPastas.length > 0 ? novasPastas[0].id : null);
      }

      // Registrar atividade
      const pastaExcluida = pastas.find(p => p.id === id);
      await supabase
        .from('user_activity_logs')
        .insert([
          {
            user_id: userId,
            acao: 'excluiu pasta',
            detalhes: `Excluiu pasta "${pastaExcluida?.nome}"`
          }
        ]);

      toast({
        title: "Pasta excluída!",
        description: `A pasta "${pastaExcluida?.nome}" foi excluída com sucesso.`
      });

    } catch (error) {
      console.error('Erro ao excluir pasta:', error);
      toast({
        title: "Erro ao excluir pasta",
        description: "Não foi possível excluir a pasta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleFavoritar = async (id: string) => {
    try {
      const anotacao = anotacoes.find(a => a.id === id);
      if (!anotacao) return;

      const novoStatus = !anotacao.favorito;
      const userId = localStorage.getItem('user_id') || 'anonymous';

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('apostila_anotacoes')
        .update({ favorito: novoStatus })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      // Atualizar no estado local
      setAnotacoes(
        anotacoes.map(a => 
          a.id === id ? { ...a, favorito: novoStatus } : a
        )
      );

      // Registrar atividade
      await supabase
        .from('user_activity_logs')
        .insert([
          {
            user_id: userId,
            acao: novoStatus ? 'adicionou aos favoritos' : 'removeu dos favoritos',
            anotacao_id: id,
            detalhes: `${novoStatus ? 'Adicionou' : 'Removeu'} "${anotacao.titulo}" ${novoStatus ? 'aos' : 'dos'} favoritos`
          }
        ]);

    } catch (error) {
      console.error('Erro ao favoritar/desfavoritar:', error);
      toast({
        title: "Erro ao atualizar favoritos",
        description: "Não foi possível atualizar o status de favorito. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getAllTags = () => {
    const allTags: string[] = [];
    anotacoes.forEach(anotacao => {
      anotacao.tags?.forEach(tag => {
        if (!allTags.includes(tag)) {
          allTags.push(tag);
        }
      });
    });
    return allTags.sort();
  };

  const toggleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isFullscreen ? 'max-w-[98vw] h-[98vh] max-h-[98vh]' : 'max-w-[90vw] w-[1400px] h-[85vh] max-h-[85vh]'} bg-[#0D0D0D] text-white rounded-2xl p-0 overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}
        style={{
          boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5), 0 0 80px rgba(66, 197, 245, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <DialogHeader className="py-4 px-6 flex flex-row justify-between items-center border-b border-gray-800 bg-gradient-to-r from-[#0D0D0D] to-[#171717]">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#42C5F5] to-[#0A84FF] flex items-center justify-center shadow-lg">
              <BookOpen size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl text-white">Apostila Inteligente</span>
              <span className="text-xs text-gray-400 font-normal">Organize suas anotações com IA</span>
            </div>
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-9 w-9 hover:bg-gray-800 text-gray-400 hover:text-white"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)} 
              className="rounded-full h-9 w-9 hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Barra Lateral Esquerda (Pastas) */}
          <div className="w-[260px] border-r border-gray-800 bg-[#0D0D0D] flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium flex items-center gap-1.5">
                  <FolderOpen size={15} className="text-gray-400" />
                  <span>Minhas Pastas</span>
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-7 w-7 hover:bg-[#1A1A1A] text-[#42C5F5]"
                        onClick={() => setCriandoPasta(true)}
                      >
                        <FolderPlus size={15} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Criar nova pasta</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {criandoPasta && (
                <div className="mb-4 bg-[#111111] p-3 rounded-xl animate-in fade-in-50 slide-in-from-left duration-300 border border-gray-800">
                  <Input 
                    placeholder="Nome da pasta" 
                    className="bg-[#1A1A1A] border-gray-700 mb-2 h-9 text-sm"
                    value={novaPasta.nome}
                    onChange={(e) => setNovaPasta({...novaPasta, nome: e.target.value})}
                  />
                  <div className="flex justify-between">
                    <div className="flex gap-1">
                      {["#42C5F5", "#F5C542", "#4CAF50", "#F44336", "#9C27B0", "#2196F3", "#FF9800"].map(cor => (
                        <button
                          key={cor}
                          className={`w-5 h-5 rounded-full border ${novaPasta.cor === cor ? 'border-white shadow-glow' : 'border-gray-600'}`}
                          style={{ 
                            backgroundColor: cor,
                            boxShadow: novaPasta.cor === cor ? `0 0 10px ${cor}80` : 'none'
                          }}
                          onClick={() => setNovaPasta({...novaPasta, cor})}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 hover:bg-gray-700 text-sm"
                        onClick={() => setCriandoPasta(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-7 px-3 bg-[#42C5F5] hover:bg-[#3BABDB] text-white text-sm"
                        onClick={handleCriarPasta}
                      >
                        Criar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 py-2">
              <div className="flex flex-col gap-1 px-2">
                {pastas.map(pasta => (
                  <div 
                    key={pasta.id}
                    className={`px-3 py-2.5 rounded-lg flex items-center justify-between group cursor-pointer transition-all duration-200
                    ${pastaSelecionada === pasta.id 
                      ? 'bg-gradient-to-r from-[#171717] to-[#1c1c1c] border-l-4 pl-2' 
                      : 'hover:bg-[#171717] border-l-4 border-transparent pl-2'}`}
                    style={{
                      borderLeftColor: pastaSelecionada === pasta.id ? pasta.cor : 'transparent'
                    }}
                    onClick={() => setPastaSelecionada(pasta.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pasta.cor }}></div>
                      <span className="truncate font-medium text-sm">{pasta.nome}</span>
                      {pasta.contagem !== undefined && (
                        <Badge variant="outline" className="ml-1 h-5 py-0 text-xs bg-[#1A1A1A] text-gray-400 hover:bg-[#1A1A1A]">
                          {pasta.contagem}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-1 rounded hover:bg-gray-700 text-gray-400">
                              <Pencil size={13} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            <p>Editar pasta</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              className="p-1 rounded hover:bg-gray-700 text-gray-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExcluirPasta(pasta.id);
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            <p>Excluir pasta</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-800">
              <Button className="w-full bg-[#42C5F5] hover:bg-[#3BABDB] gap-2">
                <Plus size={16} /> Nova Anotação
              </Button>
            </div>
          </div>

          {/* Área Central (Lista de Anotações) */}
          <div className="w-[350px] border-r border-gray-800 bg-[#0D0D0D] flex flex-col">
            {/* Cabeçalho da área central */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium flex items-center gap-1.5">
                  <FileText size={15} className="text-gray-400" />
                  <span>Anotações</span>
                </h3>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setVisualMode(visualMode === "list" ? "grid" : "list")}
                          className="rounded-full h-7 w-7 hover:bg-[#1A1A1A]"
                        >
                          {visualMode === "list" ? <LayoutGrid size={15} /> : <ListFilter size={15} />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Alternar visualização</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-7 w-7 hover:bg-[#1A1A1A] text-[#42C5F5]"
                        >
                          <Plus size={15} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Criar nova anotação</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input 
                  placeholder="Pesquisar anotações..." 
                  className="pl-9 bg-[#151515] border-gray-800 h-9 text-sm focus-visible:ring-[#42C5F5]"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                />
              </div>

              {/* Filtros e ordenação */}
              <div className="flex justify-between items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 px-2 text-xs rounded-lg ${showTagsFilter ? 'bg-[#1A1A1A] text-[#42C5F5]' : 'text-gray-400'}`}
                          onClick={() => setShowTagsFilter(!showTagsFilter)}
                        >
                          <Filter size={13} className="mr-1" /> Filtrar
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Filtrar por tags</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs rounded-lg text-gray-400"
                          onClick={() => setSortBy(sortBy === "recentes" ? "az" : sortBy === "az" ? "favoritos" : "recentes")}
                        >
                          <Shuffle size={13} className="mr-1" /> 
                          {sortBy === "recentes" ? "Recentes" : sortBy === "az" ? "A-Z" : "Favoritos"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Alterar ordenação</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <span className="text-xs text-gray-500">{getAnotacoesDaPasta().length} anotações</span>
              </div>

              {/* Filtro de tags */}
              {showTagsFilter && (
                <div className="bg-[#151515] rounded-lg p-2 mb-3 border border-gray-800 animate-in slide-in-from-top duration-200">
                  <div className="text-xs text-gray-400 mb-2">Filtrar por tags:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {getAllTags().map(tag => (
                      <Badge 
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer text-xs py-0 px-2 ${selectedTags.includes(tag) ? 'bg-[#42C5F5] hover:bg-[#3BABDB]' : 'hover:bg-gray-800'}`}
                        onClick={() => toggleTagSelection(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lista de anotações */}
            <ScrollArea className="flex-1">
              <div className={`p-2 ${visualMode === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}`}>
                {getAnotacoesDaPasta().length > 0 ? (
                  getAnotacoesDaPasta().map(anotacao => (
                    <div 
                      key={anotacao.id}
                      className={`${visualMode === "grid" 
                        ? "p-3 h-[180px] flex flex-col" 
                        : "p-3"} 
                        rounded-lg bg-gradient-to-b from-[#151515] to-[#121212] cursor-pointer group
                        ${anotacaoSelecionada === anotacao.id 
                          ? 'ring1 ring-[#42C5F5] shadow-glow' 
                          : 'hover:bg-[#171717] border border-gray-800 hover:border-gray-700'}
                        transition-all duration-200 ease-in-out transform hover:-translate-y-0.5`}
                      onClick={() => setAnotacaoSelecionada(anotacao.id)}
                      style={{
                        boxShadow: anotacaoSelecionada === anotacao.id ? '0 0 15px rgba(66, 197, 245, 0.15)' : 'none'
                      }}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-medium text-white truncate text-sm">{anotacao.titulo}</h4>
                        <div className="flex gap-0.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  className={`p-1 rounded hover:bg-gray-700 ${anotacao.favorito ? 'text-amber-400' : 'text-gray-500'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFavoritar(anotacao.id);
                                  }}
                                >
                                  <Star size={13} fill={anotacao.favorito ? "currentColor" : "none"} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs">
                                <p>{anotacao.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <p className={`text-xs text-gray-400 line-clamp-${visualMode === "grid" ? "3" : "2"} flex-grow`}>
                        {anotacao.resumo}
                      </p>

                      {visualMode === "grid" && (
                        <div className="mt-auto">
                          {anotacao.tags && (
                            <div className="flex flex-wrap gap-1 mt-2 mb-1.5">
                              {anotacao.tags.slice(0, 2).map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-xs py-0 px1.5 bg-[#1A1A1A] text-gray-400 border-gray-700"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {anotacao.tags.length > 2 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs py-0 px-1.5 bg-[#1A1A1A] text-gray-400 border-gray-700"
                                >
                                  +{anotacao.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="flex items-center gap-1 text-gray-500 text-[10px]">
                          <Clock size={10} />
                          {anotacao.ultimaEdicao?.toLocaleDateString() || anotacao.data.toLocaleDateString()}
                        </span>
                        <span 
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            anotacao.modelo === "Estudo Completo" 
                              ? 'bg-[#42C5F5]/10 text-[#42C5F5]' 
                              : 'bg-[#9C27B0]/10 text-[#D39EE2]'
                          }`}
                        >
                          {anotacao.modelo}
                        </span>
                      </div>

                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-700 text-gray-300 text-xs">
                          <Eye size={12} className="mr-1"/> Ver
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-700 text-gray-300 text-xs">
                          <Pencil size={12} className="mr-1"/> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-700 text-gray-300 text-xs">
                          <Trash2 size={12} className="mr-1"/> Excluir
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 p-4">
                    <FileText size={40} className="mb-2 text-gray-600" />
                    <p className="text-center text-sm mb-1">Nenhuma anotação encontrada</p>
                    <p className="text-xs text-gray-500 text-center">Crie uma nova anotação ou altere seus filtros de busca</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Área Direita (Visualização e Ações) */}
          <div className="flex-1 bg-[#0D0D0D] flex flex-col">
            {anotacaoSelecionada && getAnotacaoSelecionada() ? (
              <>
                <div className="px-6 py-4 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-bold">{getAnotacaoSelecionada()?.titulo}</h2>
                      {getAnotacaoSelecionada()?.favorito && (
                        <Star size={16} className="text-amber-400" fill="currentColor" />
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent border-gray-700 hover:bg-gray-800">
                              <Pencil size={14} /> Editar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Editar anotação</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent border-gray-700 hover:bg-gray-800">
                              <ArrowRight size={14} /> Mover
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Mover para outra pasta</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent border-gray-700 hover:bg-gray-800">
                              <Download size={14} /> Baixar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Baixar como PDF</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-transparent border-gray-700 hover:bg-gray-800">
                              <Share2 size={14} /> Compartilhar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Compartilhar anotação</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <FolderOpen size={14} className="text-gray-400" />
                      <span className="text-gray-400">
                        {pastas.find(p => p.id === getAnotacaoSelecionada()?.pastaId)?.nome}
                      </span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <div className="flex items-center gap-1">
                      <CalendarDays size={14} className="text-gray-400" />
                      <span className="text-gray-400">
                        Criado em {getAnotacaoSelecionada()?.data.toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-gray-400">
                        Editado em {getAnotacaoSelecionada()?.ultimaEdicao?.toLocaleDateString() || getAnotacaoSelecionada()?.data.toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <div className="flex items-center gap-1">
                      <Eye size={14} className="text-gray-400" />
                      <span className="text-gray-400">{getAnotacaoSelecionada()?.visualizacoes || 0} visualizações</span>
                    </div>
                  </div>

                  {getAnotacaoSelecionada()?.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {getAnotacaoSelecionada()?.tags?.map((tag, index) => (
                        <Badge 
                          key={index} 
                          className="bg-[#1A1A1A] hover:bg-[#222] text-gray-300 border-none"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Tabs defaultValue="conteudo" className="flex-1 flex flex-col">
                  <div className="px-6 py-2 border-b border-gray-800 bg-[#0a0a0a]">
                    <TabsList className="bg-[#151515] p-1">
                      <TabsTrigger value="conteudo" className="data-[state=active]:bg-[#42C5F5] data-[state=active]:text-white">
                        Conteúdo
                      </TabsTrigger>
                      <TabsTrigger value="historico" className="data-[state=active]:bg-[#42C5F5] data-[state=active]:text-white">
                        Histórico de Versões
                      </TabsTrigger>
                      <TabsTrigger value="estatisticas" className="data-[state=active]:bg-[#42C5F5] data-[state=active]:text-white">
                        Estatísticas
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="conteudo" className="flex-1 p-0 m-0">
                    <ScrollArea className="flex-1 h-full custom-scrollbar p-6">
                      <div className="max-w-4xl mx-auto prose prose-invert prose-headings:font-display prose-headings:font-bold">
                        {getAnotacaoSelecionada()?.conteudo.split('\n').map((line, i) => {
                          if (line.startsWith('# ')) {
                            return (
                              <h1 
                                key={i} 
                                className="text-3xl font-bold mt-6 mb-4 text-white pb-2 border-b border-gray-800"
                              >
                                {line.substring(2)}
                              </h1>
                            );
                          } else if (line.startsWith('## ')) {
                            return (
                              <h2 
                                key={i} 
                                className="text-xl font-bold mt-6 mb-3 text-white group flex items-center"
                              >
                                <span className="bg-gradient-to-r from-[#42C5F5] to-[#3BABDB] w-1 h-6 rounded mr-2 opacity-80"></span>
                                {line.substring(3)}
                              </h2>
                            );
                          } else if (line.startsWith('- ')) {
                            return (
                              <li 
                                key={i} 
                                className="ml-5 my-1 text-gray-300"
                              >
                                {line.substring(2)}
                              </li>
                            );
                          } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                            const numberMatch = line.match(/^\d+\.\s/);
                            const number = numberMatch ? numberMatch[0] : "";
                            return (
                              <div key={i} className="flex ml-3 my-2">
                                <span className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-gray-700 flex items-center justify-center mr-2 text-[#42C5F5] text-sm font-medium flex-shrink-0">
                                  {number.replace('. ', '')}
                                </span>
                                <span className="text-gray-300">{line.substring(number.length)}</span>
                              </div>
                            );
                          } else if (line === '') {
                            return <p key={i}>&nbsp;</p>;
                          } else {
                            return <p key={i} className="my-2 text-gray-300">{line}</p>;
                          }
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="historico" className="flex-1 p-0 m-0">
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <History size={40} className="mx-auto mb-4 text-gray-600" />
                        <h3 className="text-lg font-medium mb-2">Histórico de Versões</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          Acompanhe as alterações feitas nesta anotação ao longo do tempo e restaure versões anteriores quando necessário.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="estatisticas" className="flex-1 p-0 m-0">
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <SlidersHorizontal size={40} className="mx-auto mb-4 text-gray-600" />
                        <h3 className="text-lg font-medium mb-2">Estatísticas</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          Visualize estatísticas detalhadas sobre suas anotações, frequência de uso e sugestões de revisão.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] flex items-center justify-center mb-6 border border-gray-800">
                  <BookOpen size={40} className="text-[#42C5F5] opacity-60" />
                </div>
                <h3 className="text-xl font-medium mb-2">Nenhuma anotação selecionada</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Selecione uma anotação da lista para visualizar seu conteúdo ou crie uma nova anotação.
                </p>
                <Button className="px-5 py-6 h-auto bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] hover:from-[#3BABDB] hover:to-[#0972DB] shadow-lg shadow-blue-900/20">
                  <Plus size={18} className="mr-2" /> Criar Nova Anotação
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApostilaInteligenteModal;