
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Users,
  Target,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Edit3,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Presentation,
  Video,
  Group,
  MessageCircle,
  Play,
  FileText,
  Activity,
  Separator
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator as UISeparator } from '@/components/ui/separator';

interface PlanoAulaPreviewProps {
  data?: any;
  isLightMode?: boolean;
}

interface EtapaDesenvolvimento {
  id?: string;
  titulo: string;
  descricao: string;
  tipoInteracao: string;
}

const INTERACTION_ICONS = {
  'Apresentação + debate': Presentation,
  'Assistir + Discussão': Video,
  'Dinâmica em grupo': Group,
  'Discussão guiada': MessageCircle,
  'Atividade prática': Activity,
  'Leitura + análise': FileText,
  'Apresentação': Presentation,
  'Vídeo': Video,
  'Grupo': Group,
  'Discussão': MessageCircle,
  'Prática': Activity,
  'Leitura': FileText,
  'default': Play
};

const getInteractionIcon = (tipoInteracao: string) => {
  const normalizedType = tipoInteracao?.toLowerCase() || '';
  
  for (const [key, icon] of Object.entries(INTERACTION_ICONS)) {
    if (key !== 'default' && normalizedType.includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  if (normalizedType.includes('apresenta')) return INTERACTION_ICONS['Apresentação'];
  if (normalizedType.includes('video') || normalizedType.includes('vídeo')) return INTERACTION_ICONS['Vídeo'];
  if (normalizedType.includes('grupo')) return INTERACTION_ICONS['Grupo'];
  if (normalizedType.includes('discuss')) return INTERACTION_ICONS['Discussão'];
  if (normalizedType.includes('prática') || normalizedType.includes('atividade')) return INTERACTION_ICONS['Prática'];
  if (normalizedType.includes('leitura')) return INTERACTION_ICONS['Leitura'];
  
  return INTERACTION_ICONS['default'];
};

const EtapaCard: React.FC<{
  etapa: EtapaDesenvolvimento;
  index: number;
  total: number;
  isLightMode: boolean;
  onEdit: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}> = ({ etapa, index, total, isLightMode, onEdit, onMoveUp, onMoveDown }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = getInteractionIcon(etapa.tipoInteracao);

  return (
    <Reorder.Item value={etapa} id={etapa.id || `etapa-${index}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <Card className={`mb-4 border-2 transition-all duration-200 hover:shadow-lg ${
          isLightMode 
            ? 'bg-white border-gray-200 hover:border-orange-300' 
            : 'bg-gray-800 border-gray-700 hover:border-orange-500'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className={`p-2 rounded-lg ${
                  isLightMode ? 'bg-orange-100' : 'bg-orange-900/30'
                }`}>
                  <IconComponent className={`h-5 w-5 ${
                    isLightMode ? 'text-orange-600' : 'text-orange-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold text-lg ${
                    isLightMode ? 'text-gray-900' : 'text-white'
                  }`}>
                    {etapa.titulo}
                  </h4>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {etapa.tipoInteracao}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveDown(index)}
                  disabled={index === total - 1}
                  className="h-8 w-8 p-0"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(index)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className={`text-sm mb-3 ${
              isLightMode ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {isExpanded ? etapa.descricao : `${etapa.descricao.substring(0, 100)}${etapa.descricao.length > 100 ? '...' : ''}`}
            </div>
            
            {etapa.descricao.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 px-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Recolher
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expandir
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Reorder.Item>
  );
};

const PlanoAulaPreview: React.FC<PlanoAulaPreviewProps> = ({ data, isLightMode = true }) => {
  const [etapas, setEtapas] = useState<EtapaDesenvolvimento[]>(() => {
    if (data?.desenvolvimento && Array.isArray(data.desenvolvimento)) {
      return data.desenvolvimento.map((etapa: any, index: number) => ({
        id: `etapa-${index}`,
        titulo: etapa.titulo || etapa.title || `Etapa ${index + 1}`,
        descricao: etapa.descricao || etapa.description || etapa.atividade || '',
        tipoInteracao: etapa.tipoInteracao || etapa.tipo || etapa.metodo || 'Atividade prática'
      }));
    }
    
    // Dados de exemplo se não houver desenvolvimento
    return [
      {
        id: 'etapa-1',
        titulo: "1. Introdução e Contextualização",
        descricao: "Apresente o contexto histórico da Europa no século XVIII, destacando os aspectos sociais, políticos e econômicos que levaram à Revolução Francesa.",
        tipoInteracao: "Apresentação + debate"
      },
      {
        id: 'etapa-2',
        titulo: "2. Vídeo Interativo",
        descricao: "Assista com os alunos um vídeo de 5 minutos sobre os três estados franceses, pausando para discussões e esclarecimentos.",
        tipoInteracao: "Assistir + Discussão"
      },
      {
        id: 'etapa-3',
        titulo: "3. Atividade Prática",
        descricao: "Divida os alunos em grupos para simular os três estados franceses e debater seus interesses conflitantes.",
        tipoInteracao: "Dinâmica em grupo"
      },
      {
        id: 'etapa-4',
        titulo: "4. Reflexão Final",
        descricao: "Recolha as conclusões dos grupos e faça uma análise guiada sobre as causas e consequências da Revolução Francesa.",
        tipoInteracao: "Discussão guiada"
      }
    ];
  });

  const handleEditEtapa = useCallback((index: number) => {
    console.log(`Editando etapa ${index + 1}:`, etapas[index]);
    // Aqui você pode implementar a lógica de edição
  }, [etapas]);

  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) {
      const newEtapas = [...etapas];
      [newEtapas[index - 1], newEtapas[index]] = [newEtapas[index], newEtapas[index - 1]];
      setEtapas(newEtapas);
    }
  }, [etapas]);

  const handleMoveDown = useCallback((index: number) => {
    if (index < etapas.length - 1) {
      const newEtapas = [...etapas];
      [newEtapas[index], newEtapas[index + 1]] = [newEtapas[index + 1], newEtapas[index]];
      setEtapas(newEtapas);
    }
  }, [etapas]);

  const handleReorder = useCallback((newEtapas: EtapaDesenvolvimento[]) => {
    setEtapas(newEtapas);
  }, []);

  const avaliacao = data?.avaliacao || "Os alunos serão avaliados com base em participação nas dinâmicas e um mini questionário ao final.";

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg ${
          isLightMode ? 'bg-orange-100' : 'bg-orange-900/30'
        }`}>
          <Activity className={`h-6 w-6 ${
            isLightMode ? 'text-orange-600' : 'text-orange-400'
          }`} />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${
            isLightMode ? 'text-gray-900' : 'text-white'
          }`}>
            Desenvolvimento da Aula
          </h3>
          <p className={`text-sm ${
            isLightMode ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Arraste e reordene as etapas conforme necessário
          </p>
        </div>
      </div>

      {/* Lista de etapas com drag and drop */}
      <Reorder.Group
        axis="y"
        values={etapas}
        onReorder={handleReorder}
        className="space-y-0"
      >
        <AnimatePresence>
          {etapas.map((etapa, index) => (
            <EtapaCard
              key={etapa.id || `etapa-${index}`}
              etapa={etapa}
              index={index}
              total={etapas.length}
              isLightMode={isLightMode}
              onEdit={handleEditEtapa}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Seção de Avaliação */}
      <div className="mt-8">
        <UISeparator className="mb-6" />
        
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-lg ${
            isLightMode ? 'bg-blue-100' : 'bg-blue-900/30'
          }`}>
            <Target className={`h-6 w-6 ${
              isLightMode ? 'text-blue-600' : 'text-blue-400'
            }`} />
          </div>
          
          <div className="flex-1">
            <h4 className={`text-lg font-semibold mb-3 ${
              isLightMode ? 'text-gray-900' : 'text-white'
            }`}>
              Avaliação
            </h4>
            
            <Card className={`${
              isLightMode 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-blue-900/20 border-blue-700'
            }`}>
              <CardContent className="p-4">
                <p className={`text-sm ${
                  isLightMode ? 'text-blue-800' : 'text-blue-200'
                }`}>
                  {avaliacao}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Estatísticas do plano */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${
          isLightMode ? 'bg-gray-50' : 'bg-gray-800/50'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className={`h-5 w-5 ${
                isLightMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <span className={`font-semibold ${
                isLightMode ? 'text-gray-900' : 'text-white'
              }`}>
                {etapas.length}
              </span>
            </div>
            <p className={`text-sm ${
              isLightMode ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Etapas de Desenvolvimento
            </p>
          </CardContent>
        </Card>

        <Card className={`${
          isLightMode ? 'bg-gray-50' : 'bg-gray-800/50'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className={`h-5 w-5 ${
                isLightMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <span className={`font-semibold ${
                isLightMode ? 'text-gray-900' : 'text-white'
              }`}>
                {new Set(etapas.map(e => e.tipoInteracao)).size}
              </span>
            </div>
            <p className={`text-sm ${
              isLightMode ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Tipos de Interação
            </p>
          </CardContent>
        </Card>

        <Card className={`${
          isLightMode ? 'bg-gray-50' : 'bg-gray-800/50'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className={`h-5 w-5 ${
                isLightMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <span className={`font-semibold ${
                isLightMode ? 'text-gray-900' : 'text-white'
              }`}>
                {Math.ceil(etapas.length * 15)}min
              </span>
            </div>
            <p className={`text-sm ${
              isLightMode ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Tempo Estimado
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanoAulaPreview;
