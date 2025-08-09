
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Clock, Users, Target, Star, ChevronRight, 
  Play, Eye, Edit3, Copy, Share2, Download, Filter,
  CheckCircle2, AlertCircle, Zap, FileText, Search,
  Lightbulb, MessageSquare, Beaker, Calculator,
  PenTool, Monitor, Gamepad2, Award, Compass,
  Hash, Tag, Timer, BarChart3, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AtividadesData, AtividadeRecurso, AtividadesDataProcessor } from './AtividadesData';
import { useTheme } from '@/components/ThemeProvider';

interface AtividadesInterfaceProps {
  dados?: AtividadesData;
  onAtividadeClick?: (atividade: AtividadeRecurso) => void;
  onEditarAtividade?: (atividade: AtividadeRecurso) => void;
  isLoading?: boolean;
}

export default function AtividadesInterface({ 
  dados, 
  onAtividadeClick, 
  onEditarAtividade,
  isLoading = false 
}: AtividadesInterfaceProps) {
  const { theme } = useTheme();
  const [atividadesData, setAtividadesData] = useState<AtividadesData | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroDificuldade, setFiltroDificuldade] = useState<string>('todas');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [atividadesFiltradas, setAtividadesFiltradas] = useState<AtividadeRecurso[]>([]);

  // Inicializar dados
  useEffect(() => {
    if (dados) {
      setAtividadesData(dados);
    } else {
      // Usar dados padrão se não fornecidos
      setAtividadesData(AtividadesDataProcessor.gerarDadosPadrao());
    }
  }, [dados]);

  // Aplicar filtros
  useEffect(() => {
    if (!atividadesData) return;

    let atividades = [...atividadesData.atividadesRecursos];

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      atividades = atividades.filter(atividade => atividade.tipo === filtroTipo);
    }

    // Filtro por dificuldade
    if (filtroDificuldade !== 'todas') {
      atividades = atividades.filter(atividade => atividade.dificuldade === filtroDificuldade);
    }

    // Filtro por texto
    if (buscaTexto) {
      const textoBusca = buscaTexto.toLowerCase();
      atividades = atividades.filter(atividade =>
        atividade.titulo.toLowerCase().includes(textoBusca) ||
        atividade.descricao.toLowerCase().includes(textoBusca) ||
        atividade.tags.some(tag => tag.toLowerCase().includes(textoBusca))
      );
    }

    setAtividadesFiltradas(atividades);
  }, [atividadesData, filtroTipo, filtroDificuldade, buscaTexto]);

  // Obter ícone do tipo de atividade
  const obterIconeTipo = (tipo: AtividadeRecurso['tipo']) => {
    const icones = {
      'exercicio': <FileText className="h-5 w-5" />,
      'leitura': <BookOpen className="h-5 w-5" />,
      'pesquisa': <Search className="h-5 w-5" />,
      'pratica': <Zap className="h-5 w-5" />,
      'projeto': <Lightbulb className="h-5 w-5" />,
      'discussao': <MessageSquare className="h-5 w-5" />,
      'avaliacao': <BarChart3 className="h-5 w-5" />
    };
    return icones[tipo] || <FileText className="h-5 w-5" />;
  };

  // Obter cor do tipo
  const obterCorTipo = (tipo: AtividadeRecurso['tipo']) => {
    const cores = {
      'exercicio': 'bg-blue-500',
      'leitura': 'bg-green-500',
      'pesquisa': 'bg-purple-500',
      'pratica': 'bg-yellow-500',
      'projeto': 'bg-orange-500',
      'discussao': 'bg-pink-500',
      'avaliacao': 'bg-red-500'
    };
    return cores[tipo] || 'bg-gray-500';
  };

  // Obter cor da dificuldade
  const obterCorDificuldade = (dificuldade: AtividadeRecurso['dificuldade']) => {
    const cores = {
      'facil': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      'medio': 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      'dificil': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
    };
    return cores[dificuldade] || cores.medio;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando atividades...</p>
        </div>
      </div>
    );
  }

  if (!atividadesData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Erro ao carregar dados das atividades</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header com filtros */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#FF6B00]" />
              Atividades e Recursos
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {atividadesFiltradas.length} atividade{atividadesFiltradas.length !== 1 ? 's' : ''} encontrada{atividadesFiltradas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar atividades..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="exercicio">Exercício</SelectItem>
              <SelectItem value="leitura">Leitura</SelectItem>
              <SelectItem value="pesquisa">Pesquisa</SelectItem>
              <SelectItem value="pratica">Prática</SelectItem>
              <SelectItem value="projeto">Projeto</SelectItem>
              <SelectItem value="discussao">Discussão</SelectItem>
              <SelectItem value="avaliacao">Avaliação</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroDificuldade} onValueChange={setFiltroDificuldade}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="facil">Fácil</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="dificil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {atividadesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Nenhuma atividade encontrada com os filtros aplicados
            </p>
          </div>
        ) : (
          <>
            {/* Grade de Mini-Cards das Atividades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <AnimatePresence>
                {atividadesFiltradas.map((atividade, index) => (
                  <motion.div
                    key={atividade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border border-gray-200 dark:border-gray-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-lg ${obterCorTipo(atividade.tipo)} flex items-center justify-center text-white mb-3`}>
                            {obterIconeTipo(atividade.tipo)}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditarAtividade?.(atividade);
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Função de copiar
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          {atividade.titulo}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {atividade.descricao}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className={obterCorDificuldade(atividade.dificuldade)}>
                            {atividade.dificuldade === 'facil' ? 'Fácil' : 
                             atividade.dificuldade === 'medio' ? 'Médio' : 'Difícil'}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {atividade.duracao}
                          </Badge>
                        </div>

                        {/* Tags */}
                        {atividade.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {atividade.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                <Hash className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {atividade.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{atividade.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Objetivos */}
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Objetivos:
                          </p>
                          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            {atividade.objetivos.slice(0, 2).map((objetivo, objIndex) => (
                              <li key={objIndex} className="flex items-start gap-1">
                                <Target className="h-3 w-3 mt-0.5 text-[#FF6B00] flex-shrink-0" />
                                <span className="line-clamp-1">{objetivo}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Recursos necessários */}
                        {atividade.recursos.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              Recursos:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {atividade.recursos.slice(0, 2).map((recurso, recIndex) => (
                                <Badge key={recIndex} variant="outline" className="text-xs">
                                  {recurso}
                                </Badge>
                              ))}
                              {atividade.recursos.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{atividade.recursos.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Botão de ação */}
                        <Button
                          className="w-full mt-4"
                          onClick={() => onAtividadeClick?.(atividade)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar Atividade
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orientações Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-[#FF6B00]" />
                    Orientações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {atividadesData.orientacoesGerais}
                  </p>
                </CardContent>
              </Card>

              {/* Materiais Necessários */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#FF6B00]" />
                    Materiais Necessários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {atividadesData.materiaisNecessarios.map((material, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-300">{material}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-[#FF6B00]" />
                      <span className="font-medium">Tempo estimado total:</span>
                      <Badge variant="outline">{atividadesData.tempoEstimado}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Observações */}
            {atividadesData.observacoes && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#FF6B00]" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {atividadesData.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
