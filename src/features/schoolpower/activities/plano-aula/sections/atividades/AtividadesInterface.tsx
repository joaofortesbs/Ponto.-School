import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Presentation, 
  Video, 
  Mic, 
  FileText, 
  Gamepad2, 
  Square, 
  BookOpen, 
  PenTool, 
  Map, 
  Image, 
  Activity, 
  Users, 
  CheckCircle, 
  MessageSquare, 
  HelpCircle, 
  Zap, 
  Users2, 
  Play, 
  Search, 
  Edit3,
  ListChecks,
  Brain,
  Beaker,
  Target,
  Sparkles,
  Filter,
  Grid3x3,
  List
} from 'lucide-react';
import { AtividadesDataProcessor, AtividadeRecurso, AtividadesData } from './AtividadesData';
import { DesenvolvimentoIntegrator } from '../desenvolvimento/DesenvolvimentoIntegrator';
import { DesenvolvimentoData } from '../desenvolvimento/DesenvolvimentoData';

interface AtividadesInterfaceProps {
  planoData?: any;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  'presentation': Presentation,
  'video': Video,
  'mic': Mic,
  'file-text': FileText,
  'gamepad-2': Gamepad2,
  'square': Square,
  'book-open': BookOpen,
  'pen-tool': PenTool,
  'map': Map,
  'image': Image,
  'activity': Activity,
  'users': Users,
  'check-circle': CheckCircle,
  'message-square': MessageSquare,
  'help-circle': HelpCircle,
  'zap': Zap,
  'users-2': Users2,
  'play': Play,
  'search': Search,
  'edit-3': Edit3,
  'list-checks': ListChecks,
  'brain': Brain,
  'flask': Beaker
};

const AtividadesInterface: React.FC<AtividadesInterfaceProps> = ({ planoData }) => {
  const [atividadesData, setAtividadesData] = useState<AtividadesData | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'atividade' | 'recurso'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [desenvolvimentoData, setDesenvolvimentoData] = useState<DesenvolvimentoData | null>(null);

  // Processar dados sempre que planoData mudar
  useEffect(() => {
    console.log('🔄 AtividadesInterface: Processando dados recebidos');

    if (planoData) {
      try {
        const processedData = AtividadesDataProcessor.processarDadosAtividades({
          planoData: planoData,
        });

        setAtividadesData(processedData);
        console.log('✅ AtividadesInterface: Dados processados com sucesso', processedData);
      } catch (error) {
        console.error('❌ AtividadesInterface: Erro ao processar dados', error);
      }
    }
  }, [planoData]);

  // Buscar dados de desenvolvimento
  useEffect(() => {
    console.log('🔄 AtividadesInterface: Buscando dados de desenvolvimento');
    const fetchDesenvolvimento = async () => {
      try {
        const data = await DesenvolvimentoIntegrator.buscarDadosDesenvolvimento();
        setDesenvolvimentoData(data);
        console.log('✅ AtividadesInterface: Dados de desenvolvimento carregados com sucesso', data);
      } catch (error) {
        console.error('❌ AtividadesInterface: Erro ao buscar dados de desenvolvimento', error);
      }
    };

    fetchDesenvolvimento();
  }, []);

  // Combinar dados de atividades e recursos de desenvolvimento
  const combinedData = useMemo(() => {
    let combined: AtividadeRecurso[] = [];

    // Adiciona atividades e recursos do plano de aula
    if (atividadesData?.atividades_recursos) {
      combined = [...atividadesData.atividades_recursos];
    }

    // Adiciona recursos utilizados da seção de desenvolvimento
    if (desenvolvimentoData?.recursos_utilizados) {
      const recursosDesenvolvimento: AtividadeRecurso[] = desenvolvimentoData.recursos_utilizados.map(recurso => ({
        id: `dev-${recurso.id}`, // ID único para recursos de desenvolvimento
        nome: recurso.nome,
        descricao: recurso.descricao || 'N/A',
        tipo: 'recurso', // Sempre um recurso
        icone: recurso.icone || 'activity', // Ícone padrão se não especificado
        categoria: recurso.categoria || 'Outros', // Categoria padrão
        origem_etapa: recurso.etapa_origem || null
      }));
      combined = [...combined, ...recursosDesenvolvimento];
    }
    
    console.log('🔄 AtividadesInterface: Combinando dados de atividades e desenvolvimento');
    return combined;
  }, [atividadesData, desenvolvimentoData]);

  // Filtrar atividades e recursos
  const atividadesFiltradas = useMemo(() => {
    let filtrados = combinedData;

    // Filtrar por tipo
    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter(item => item.tipo === filtroTipo);
    }

    // Filtrar por categoria
    if (filtroCategoria !== 'todas') {
      filtrados = filtrados.filter(item => item.categoria === filtroCategoria);
    }

    return filtrados;
  }, [combinedData, filtroTipo, filtroCategoria]);

  // Obter categorias únicas
  const categorias = useMemo(() => {
    if (!combinedData) return [];
    const cats = Array.from(new Set(combinedData.map(item => item.categoria).filter(Boolean)));
    return cats;
  }, [combinedData]);

  const renderIcone = (icone: string) => {
    const IconComponent = iconMap[icone] || Activity;
    return <IconComponent className="w-6 h-6" />;
  };

  const getCorTipo = (tipo: 'atividade' | 'recurso') => {
    return tipo === 'atividade' 
      ? 'bg-blue-100 text-blue-700 border-blue-200' 
      : 'bg-green-100 text-green-700 border-green-200';
  };

  const getCorCategoria = (categoria?: string) => {
    switch (categoria) {
      case 'Metodologia Ativa': return 'bg-purple-100 text-purple-700';
      case 'School Power': return 'bg-orange-100 text-orange-700';
      case 'Material Didático': return 'bg-amber-100 text-amber-700';
      case 'Avaliação': return 'bg-red-100 text-red-700';
      case 'Prática': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!atividadesData || !desenvolvimentoData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calcular total de itens combinados
  const totalCombinedItems = (atividadesData?.atividades_recursos?.length || 0) + (desenvolvimentoData?.recursos_utilizados?.length || 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Target className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Atividades e Recursos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {totalCombinedItems} itens necessários para aplicar este plano de aula
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Estatísticas rápidas */}
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {combinedData.filter(item => item.tipo === 'atividade').length} Atividades
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {combinedData.filter(item => item.tipo === 'recurso').length} Recursos
            </Badge>
          </div>
        </div>
      </div>

      {/* Filtros e Visualização */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Filtro por Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="todos">Todos os tipos</option>
            <option value="atividade">Apenas Atividades</option>
            <option value="recurso">Apenas Recursos</option>
          </select>

          {/* Filtro por Categoria */}
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        {/* Toggle de Visualização */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grade de Atividades e Recursos */}
      {atividadesFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum item encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Ajuste os filtros para ver mais atividades e recursos
          </p>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'space-y-3'
        }`}>
          {atividadesFiltradas.map((item, index) => (
            <Card 
              key={item.id} 
              className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:scale-105 rounded-2xl overflow-hidden ${
                viewMode === 'list' ? 'flex items-center p-4' : ''
              }`}
              style={{
                background: item.tipo === 'atividade' 
                  ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                  : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
              }}
            >
              <CardContent className={`${viewMode === 'grid' ? 'p-6' : 'p-0 flex-1 flex items-center gap-4'}`}>
                {viewMode === 'grid' ? (
                  <>
                    {/* Ícone e Tipo */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${
                        item.tipo === 'atividade' 
                          ? 'bg-blue-500/10 text-blue-600' 
                          : 'bg-green-500/10 text-green-600'
                      }`}>
                        {renderIcone(item.icone)}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium rounded-full px-3 py-1 ${getCorTipo(item.tipo)}`}
                      >
                        {item.tipo === 'atividade' ? 'Atividade' : 'Recurso'}
                      </Badge>
                    </div>

                    {/* Nome e Descrição */}
                    <div className="space-y-2 mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                        {item.nome}
                      </h3>
                      {item.descricao && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.descricao}
                        </p>
                      )}
                    </div>

                    {/* Footer com informações */}
                    <div className="flex items-center justify-between">
                      {item.categoria && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-1 rounded-full ${getCorCategoria(item.categoria)}`}
                        >
                          {item.categoria}
                        </Badge>
                      )}
                      {item.origem_etapa && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          Etapa {item.origem_etapa}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Vista em Lista */}
                    <div className={`p-3 rounded-xl ${
                      item.tipo === 'atividade' 
                        ? 'bg-blue-500/10 text-blue-600' 
                        : 'bg-green-500/10 text-green-600'
                    }`}>
                      {renderIcone(item.icone)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {item.nome}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium rounded-full ${getCorTipo(item.tipo)}`}
                        >
                          {item.tipo === 'atividade' ? 'Atividade' : 'Recurso'}
                        </Badge>
                      </div>
                      {item.descricao && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {item.descricao}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.categoria && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-1 rounded-full ${getCorCategoria(item.categoria)}`}
                        >
                          {item.categoria}
                        </Badge>
                      )}
                      {item.origem_etapa && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          Etapa {item.origem_etapa}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rodapé com informações */}
      <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-orange-600" />
          <div>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Recursos Automaticamente Identificados
            </p>
            <p className="text-xs text-orange-600 dark:text-gray-400">
              Estas atividades e recursos foram extraídos automaticamente do plano de desenvolvimento da aula
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtividadesInterface;