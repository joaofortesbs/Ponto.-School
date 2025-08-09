
"use client";

import React, { useState, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  BookOpen, 
  Target, 
  Lightbulb, 
  GripVertical, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  FileText,
  Users,
  Brain,
  Zap
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { DesenvolvimentoData, CardDesenvolvimento } from './DesenvolvimentoData';
import { DesenvolvimentoIntegrator } from './DesenvolvimentoIntegrator';

interface DesenvolvimentoInterfaceProps {
  data: any;
  activityData: any;
}

const DesenvolvimentoInterface: React.FC<DesenvolvimentoInterfaceProps> = ({ 
  data, 
  activityData 
}) => {
  const [cards, setCards] = useState<CardDesenvolvimento[]>(DesenvolvimentoData);
  const [isLoading, setIsLoading] = useState(false);
  const [observacoesExpanded, setObservacoesExpanded] = useState(false);
  const integrator = useRef(new DesenvolvimentoIntegrator());

  // Função para regenerar com IA
  const handleRegenerarIA = async () => {
    setIsLoading(true);
    try {
      const newCards = await integrator.current.generateDesenvolvimentoCards({
        data,
        activityData
      });
      
      if (newCards && newCards.length > 0) {
        setCards(newCards);
        toast({
          title: "✨ Desenvolvimento Regenerado!",
          description: "A IA criou uma nova sequência de desenvolvimento personalizada.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Erro ao regenerar desenvolvimento:', error);
      toast({
        title: "❌ Erro na Regeneração",
        description: "Não foi possível regenerar o desenvolvimento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ícones para diferentes tipos de atividade
  const getActivityIcon = (tipo: string) => {
    const iconMap: Record<string, any> = {
      'introducao': BookOpen,
      'explicacao': Brain,
      'demonstracao': Target,
      'pratica': Users,
      'atividade': FileText,
      'avaliacao': Zap,
      'sintese': Lightbulb,
      'default': Clock
    };
    
    const IconComponent = iconMap[tipo] || iconMap.default;
    return <IconComponent className="h-5 w-5" />;
  };

  // Card de Observações Gerais
  const observacoesGerais = {
    titulo: "Observações Gerais",
    conteudo: [
      "• Adapte o tempo de cada etapa conforme o ritmo da turma",
      "• Mantenha um ambiente participativo e acolhedor",
      "• Utilize exemplos do cotidiano dos alunos sempre que possível",
      "• Esteja preparado para revisitar conceitos se necessário",
      "• Incentive perguntas e discussões durante toda a aula"
    ]
  };

  return (
    <div className="space-y-6">
      {/* Título da Seção - Estilo Objetivos */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-orange-400/10 to-transparent rounded-xl blur-xl" />
        <div className="relative bg-gradient-to-r from-orange-50 to-white dark:from-orange-950/50 dark:to-background border border-orange-200/50 dark:border-orange-800/50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Desenvolvimento da Aula
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Sequência estruturada das etapas da aula
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Regenerar IA */}
      <div className="flex justify-end">
        <Button
          onClick={handleRegenerarIA}
          disabled={isLoading}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Regenerando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Regenerar IA
            </>
          )}
        </Button>
      </div>

      {/* Cards de Desenvolvimento com Drag and Drop */}
      <Reorder.Group 
        axis="y" 
        values={cards} 
        onReorder={setCards}
        className="space-y-4"
      >
        {cards.map((card, index) => (
          <Reorder.Item 
            key={card.id} 
            value={card}
            className="cursor-grab active:cursor-grabbing"
          >
            <motion.div
              layout
              whileDrag={{ scale: 1.02, rotateZ: 2 }}
              className="group"
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200/50 dark:hover:border-orange-800/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-background pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                          {getActivityIcon(card.tipo)}
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {card.titulo}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                            {card.duracao}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Etapa {index + 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição:</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {card.descricao}
                    </p>
                  </div>

                  {card.objetivos && card.objetivos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Objetivos:</h4>
                      <ul className="space-y-1">
                        {card.objetivos.map((objetivo, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Target className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            {objetivo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {card.atividades && card.atividades.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Atividades:</h4>
                      <ul className="space-y-1">
                        {card.atividades.map((atividade, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            {atividade}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {card.recursos && card.recursos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Recursos Necessários:</h4>
                      <div className="flex flex-wrap gap-2">
                        {card.recursos.map((recurso, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                            {recurso}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {card.avaliacaoFormativa && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Avaliação Formativa:
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {card.avaliacaoFormativa}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Card de Observações Gerais - Colapsável */}
      <Card className="border-2 border-orange-200/50 dark:border-orange-800/50 rounded-2xl overflow-hidden">
        <CardHeader 
          className="bg-gradient-to-r from-orange-50 to-orange-25 dark:from-orange-950/50 dark:to-orange-900/30 cursor-pointer hover:from-orange-100 hover:to-orange-50 dark:hover:from-orange-900/70 dark:hover:to-orange-800/40 transition-all duration-200"
          onClick={() => setObservacoesExpanded(!observacoesExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                {observacoesGerais.titulo}
              </CardTitle>
            </div>
            <motion.div
              animate={{ rotate: observacoesExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </motion.div>
          </div>
        </CardHeader>
        
        <motion.div
          initial={false}
          animate={{ 
            height: observacoesExpanded ? "auto" : 0,
            opacity: observacoesExpanded ? 1 : 0 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {observacoesGerais.conteudo.map((observacao, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  {observacao.replace('• ', '')}
                </li>
              ))}
            </ul>
          </CardContent>
        </motion.div>
      </Card>

      {/* Separador Final */}
      <Separator className="my-8" />
      
      {/* Indicador de Progresso */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ✅ Seção de Desenvolvimento configurada com {cards.length} etapas
        </p>
      </div>
    </div>
  );
};

export default DesenvolvimentoInterface;
