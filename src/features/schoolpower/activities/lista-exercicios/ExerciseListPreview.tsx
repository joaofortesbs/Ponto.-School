
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Circle, Edit3, FileText, Clock, GraduationCap, BookOpen, Target, List, AlertCircle, RefreshCw, Hash, Zap, HelpCircle, Info, X, Wand2, BookOpen as Material, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface ExerciseListPreviewProps {
  activity?: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

// Mock data para demonstração das questões
const mockQuestions = [
  {
    id: 1,
    question: "Na função f(x) = -2x + 7, qual o valor de f(3)?",
    type: "Múltipla Escolha",
    difficulty: "Médio",
    category: "Cálculo",
    alternatives: [
      { id: 'A', text: '1', isCorrect: true },
      { id: 'B', text: '-1', isCorrect: false },
      { id: 'C', text: '13', isCorrect: false },
      { id: 'D', text: '-13', isCorrect: false }
    ],
    explanation: "Para calcular f(3), substituímos x por 3 na função: f(3) = -2(3) + 7 = -6 + 7 = 1"
  },
  {
    id: 2,
    question: "Qual é o coeficiente angular da função f(x) = 3x - 5?",
    type: "Múltipla Escolha", 
    difficulty: "Fácil",
    category: "Teoria",
    alternatives: [
      { id: 'A', text: '3', isCorrect: true },
      { id: 'B', text: '-5', isCorrect: false },
      { id: 'C', text: '5', isCorrect: false },
      { id: 'D', text: '-3', isCorrect: false }
    ],
    explanation: "Em uma função do tipo f(x) = ax + b, o coeficiente angular é sempre o valor de 'a', que neste caso é 3."
  }
];

const QuestionCard: React.FC<{ question: any; index: number }> = ({ question, index }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'fácil': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'médio': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'difícil': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'múltipla escolha': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'verdadeiro/falso': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'dissertativa': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#2a2f45] rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
    >
      {/* Header da questão */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6B00]/20 rounded-full p-2">
            <span className="text-[#FF6B00] font-bold text-sm">Questão {index + 1}</span>
          </div>
          <div className="flex gap-2">
            <Badge className={cn('text-xs border', getDifficultyColor(question.difficulty))}>
              {question.difficulty}
            </Badge>
            <Badge className={cn('text-xs border', getTypeColor(question.type))}>
              {question.type}
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs border">
              {question.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Pergunta */}
      <div className="mb-6">
        <p className="text-white text-base leading-relaxed font-medium">
          {question.question}
        </p>
      </div>

      {/* Alternativas */}
      <div className="space-y-3 mb-4">
        {question.alternatives.map((alt: any) => (
          <motion.div
            key={alt.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              setSelectedAnswer(alt.id);
              setShowExplanation(true);
            }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200",
              selectedAnswer === alt.id
                ? alt.isCorrect
                  ? "bg-green-500/20 border-green-500/50 text-green-300"
                  : "bg-red-500/20 border-red-500/50 text-red-300"
                : "bg-gray-800/50 border-gray-600/30 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold",
              selectedAnswer === alt.id
                ? alt.isCorrect
                  ? "border-green-500 bg-green-500/20 text-green-300"
                  : "border-red-500 bg-red-500/20 text-red-300"
                : "border-gray-500 text-gray-400"
            )}>
              {alt.id}
            </div>
            <span className="flex-1 text-sm">{alt.text}</span>
            {selectedAnswer === alt.id && (
              <div className="ml-auto">
                {alt.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Explicação */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-600/30 pt-4"
        >
          <div className="bg-[#FF6B00]/10 rounded-lg p-4 border border-[#FF6B00]/20">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-[#FF6B00] font-medium text-sm">Explicação</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {question.explanation}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function ExerciseListPreview({ activity, isOpen, onClose, onEdit }: ExerciseListPreviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'individual' | 'all'>('all');

  if (!activity) return null;

  const customFields = activity.customFields || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-[#1a1f35] border-gray-700/50 text-white">
        <DialogHeader className="border-b border-gray-700/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF6B00]/20 rounded-lg p-2">
                <FileText className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {activity.title}
                </DialogTitle>
                <p className="text-gray-400 text-sm mt-1">
                  {activity.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: 'individual' | 'all') => setViewMode(value)}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white">Todas as questões</SelectItem>
                  <SelectItem value="individual" className="text-white">Questão individual</SelectItem>
                </SelectContent>
              </Select>
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-6 py-6">
            {/* Informações da atividade */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Questões</span>
                </div>
                <p className="text-white font-medium">{customFields['Quantidade de Questões'] || '12 questões'}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-400">Disciplina</span>
                </div>
                <p className="text-white font-medium">{customFields['Disciplina'] || 'Matemática'}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Ano</span>
                </div>
                <p className="text-white font-medium">{customFields['Ano de Escolaridade'] || '9º Ano'}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-gray-400">Dificuldade</span>
                </div>
                <p className="text-white font-medium">{customFields['Nível de Dificuldade'] || 'Médio'}</p>
              </div>
            </div>

            {/* Questões */}
            {viewMode === 'all' ? (
              <div className="space-y-6">
                {mockQuestions.map((question, index) => (
                  <QuestionCard key={question.id} question={question} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Questão {currentQuestionIndex + 1} de {mockQuestions.length}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300"
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={() => setCurrentQuestionIndex(Math.min(mockQuestions.length - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === mockQuestions.length - 1}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
                <QuestionCard question={mockQuestions[currentQuestionIndex]} index={currentQuestionIndex} />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
