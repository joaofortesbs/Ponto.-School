
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  BookOpen, 
  FileText, 
  Calendar,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolPowerStore } from '@/store/schoolPowerStore';

interface PlanItem {
  id: string;
  title: string;
  description: string;
  type: 'content' | 'material' | 'date' | 'restriction';
  completed: boolean;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
}

export const ChecklistPlanner: React.FC = () => {
  const { 
    contextData, 
    setStage, 
    setLoading, 
    setError,
    userMessage,
    isLoading 
  } = useSchoolPowerStore();

  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  useEffect(() => {
    // Gerar plano baseado no contexto
    const generatePlan = () => {
      const items: PlanItem[] = [];

      // Itens baseados no conteúdo
      contextData.content.forEach((content, index) => {
        items.push({
          id: `content-${index}`,
          title: `Desenvolver conteúdo: ${content}`,
          description: `Criar material didático específico para ${content}`,
          type: 'content',
          completed: false,
          estimatedTime: '30 min',
          priority: 'high'
        });
      });

      // Itens baseados nos materiais
      contextData.materials.forEach((material, index) => {
        items.push({
          id: `material-${index}`,
          title: `Preparar: ${material}`,
          description: `Criar e organizar ${material}`,
          type: 'material',
          completed: false,
          estimatedTime: '45 min',
          priority: 'medium'
        });
      });

      // Itens baseados nas datas
      contextData.dates.forEach((date, index) => {
        items.push({
          id: `date-${index}`,
          title: `Organizar agenda para ${date}`,
          description: `Preparar cronograma para a data ${date}`,
          type: 'date',
          completed: false,
          estimatedTime: '15 min',
          priority: 'high'
        });
      });

      // Itens baseados nas restrições
      contextData.restrictions.forEach((restriction, index) => {
        items.push({
          id: `restriction-${index}`,
          title: `Adaptar para: ${restriction}`,
          description: `Considerar ${restriction} no planejamento`,
          type: 'restriction',
          completed: false,
          estimatedTime: '20 min',
          priority: 'medium'
        });
      });

      setPlanItems(items);
    };

    generatePlan();
  }, [contextData]);

  const handleItemToggle = (itemId: string) => {
    setCompletedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleExecutePlan = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStage('execution');
    } catch (error) {
      setError('Erro ao executar plano');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content': return <BookOpen className="h-4 w-4" />;
      case 'material': return <FileText className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'restriction': return <AlertCircle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'content': return 'text-blue-400';
      case 'material': return 'text-green-400';
      case 'date': return 'text-yellow-400';
      case 'restriction': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const progress = planItems.length > 0 ? (completedItems.length / planItems.length) * 100 : 0;
  const totalTime = planItems.reduce((total, item) => {
    const time = parseInt(item.estimatedTime);
    return total + time;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Plano de Ação</h2>
        <p className="text-white/80">
          Baseado no seu contexto, aqui está o plano personalizado:
        </p>
        
        {/* Resumo do Contexto */}
        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-[#FF6B00]">{contextData.content.length}</div>
              <div className="text-white/60">Conteúdos</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-[#FF6B00]">{contextData.materials.length}</div>
              <div className="text-white/60">Materiais</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-[#FF6B00]">{contextData.dates.length}</div>
              <div className="text-white/60">Datas</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-[#FF6B00]">{totalTime}min</div>
              <div className="text-white/60">Tempo est.</div>
            </div>
          </div>
        </div>

        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Progresso do Plano</span>
            <span className="text-[#FF6B00]">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-4">
        {planItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleItemToggle(item.id)}
                    className={`
                      mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 
                      flex items-center justify-center transition-all duration-200
                      ${completedItems.includes(item.id)
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                        : 'border-white/40 hover:border-[#FF6B00]'
                      }
                    `}
                  >
                    {completedItems.includes(item.id) && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </button>

                  {/* Conteúdo */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <h3 className={`
                        font-semibold text-white transition-opacity duration-200
                        ${completedItems.includes(item.id) ? 'opacity-60 line-through' : ''}
                      `}>
                        {item.title}
                      </h3>
                    </div>
                    
                    <p className={`
                      text-white/70 text-sm transition-opacity duration-200
                      ${completedItems.includes(item.id) ? 'opacity-40' : ''}
                    `}>
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <Clock className="h-3 w-3" />
                        {item.estimatedTime}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Botão de Execução */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleExecutePlan}
          disabled={completedItems.length === 0 || isLoading}
          className={`
            px-8 py-3 text-lg font-semibold
            ${completedItems.length > 0 
              ? 'bg-[#FF6B00] hover:bg-[#FF6B00]/90' 
              : 'bg-gray-500 cursor-not-allowed'
            }
            transition-all duration-300
            disabled:opacity-50
          `}
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              </motion.div>
              Preparando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Executar com IA
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Card className="bg-white/5 backdrop-blur-md border-white/20 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#FF6B00]">{completedItems.length}</div>
            <div className="text-white/60 text-sm">Concluídos</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/20 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#FF6B00]">{planItems.length - completedItems.length}</div>
            <div className="text-white/60 text-sm">Restantes</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/20 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#FF6B00]">{Math.round(progress)}%</div>
            <div className="text-white/60 text-sm">Progresso</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/20 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#FF6B00]">{totalTime}min</div>
            <div className="text-white/60 text-sm">Tempo total</div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
