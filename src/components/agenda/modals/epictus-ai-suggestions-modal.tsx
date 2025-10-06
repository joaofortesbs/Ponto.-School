import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  BookOpen,
  CheckSquare,
  FileEdit,
  FileText,
  Lightbulb,
  LineChart,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  Video,
  Zap,
  Flame,
  Users,
  Calendar,
  Target,
  ExternalLink,
  Clock,
  Brain,
} from "lucide-react";

interface EpictusAISuggestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Suggestion {
  id: string;
  priority: "high" | "medium" | "low";
  type: "performance" | "content" | "task" | "event" | "group" | "challenge";
  title: string;
  description: string;
  discipline?: string;
  icon: React.ReactNode;
  actions: {
    label: string;
    icon: React.ReactNode;
    variant: "default" | "outline" | "ghost";
    action: () => void;
  }[];
  justification?: string;
  showJustification?: boolean;
}

const EpictusAISuggestionsModal: React.FC<EpictusAISuggestionsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      priority: "high",
      type: "performance",
      title: "Prioridade Alta: Você tem uma prova de Física amanhã",
      description:
        "Recomendo revisar os conceitos de Mecânica Quântica hoje à noite.",
      discipline: "Física",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      actions: [
        {
          label: "Ver Material",
          icon: <FileText className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
          action: () => console.log("Ver material"),
        },
        {
          label: "Criar Resumo",
          icon: <FileEdit className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
          action: () => console.log("Criar resumo"),
        },
      ],
      justification:
        "Você tem uma prova de Física amanhã e seu desempenho nos últimos exercícios sobre Mecânica Quântica foi abaixo da média. Revisar esses conceitos agora pode melhorar significativamente seu desempenho na prova.",
      showJustification: false,
    },
    {
      id: "2",
      priority: "medium",
      type: "performance",
      title: "Seu desempenho em Química caiu 15% na última semana",
      description: "Que tal revisar os conceitos de titulação?",
      discipline: "Química",
      icon: <Flame className="h-5 w-5 text-amber-500" />,
      actions: [
        {
          label: "Ver Desempenho",
          icon: <LineChart className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
          action: () => console.log("Ver desempenho"),
        },
        {
          label: "Praticar Exercícios",
          icon: <CheckSquare className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
          action: () => console.log("Praticar exercícios"),
        },
      ],
      justification:
        "Analisamos seu desempenho nas últimas atividades de Química e notamos uma queda de 15% em relação à semana anterior, especialmente em questões relacionadas à titulação. Praticar exercícios específicos sobre este tema pode ajudar a recuperar seu desempenho.",
      showJustification: false,
    },
    {
      id: "3",
      priority: "low",
      type: "challenge",
      title: "Você está com uma sequência de 7 dias de estudo!",
      description: "Continue assim para ganhar mais pontos de experiência.",
      icon: <Zap className="h-5 w-5 text-green-500" />,
      actions: [
        {
          label: "Ver Conquistas",
          icon: <Trophy className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
          action: () => console.log("Ver conquistas"),
        },
      ],
      justification:
        "Manter uma rotina consistente de estudos é fundamental para o aprendizado efetivo. Você está em uma sequência de 7 dias consecutivos de estudo, o que é excelente! Continue assim para desenvolver um hábito sólido e ganhar recompensas na plataforma.",
      showJustification: false,
    },
    {
      id: "4",
      priority: "medium",
      type: "task",
      title: "Você tem 3 tarefas pendentes com prazo para hoje",
      description: "Comece agora para não se atrasar!",
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      actions: [
        {
          label: "Ver Tarefas",
          icon: <CheckSquare className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
          action: () => console.log("Ver tarefas"),
        },
      ],
      justification:
        "Identificamos 3 tarefas em sua lista que vencem hoje e ainda não foram iniciadas. Começar agora aumentará suas chances de concluí-las a tempo e evitar o acúmulo de atividades atrasadas.",
      showJustification: false,
    },
    {
      id: "5",
      priority: "medium",
      type: "content",
      title: "Recomendamos esta videoaula sobre Funções Trigonométricas",
      description:
        "Este conteúdo pode te ajudar na próxima aula de Matemática.",
      discipline: "Matemática",
      icon: <Video className="h-5 w-5 text-purple-500" />,
      actions: [
        {
          label: "Assistir Agora",
          icon: <Video className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
          action: () => console.log("Assistir videoaula"),
        },
        {
          label: "Salvar para Depois",
          icon: <BookOpen className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
          action: () => console.log("Salvar para depois"),
        },
      ],
      justification:
        "De acordo com seu calendário, você terá uma aula sobre Funções Trigonométricas amanhã. Esta videoaula foi selecionada com base no seu estilo de aprendizagem e aborda exatamente os tópicos que serão discutidos, preparando você para participar ativamente da aula.",
      showJustification: false,
    },
    {
      id: "6",
      priority: "low",
      type: "group",
      title: "O grupo de estudos de Biologia está se reunindo hoje às 19:00",
      description: "Participe e colabore com seus colegas!",
      discipline: "Biologia",
      icon: <Users className="h-5 w-5 text-teal-500" />,
      actions: [
        {
          label: "Participar",
          icon: <Users className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
          action: () => console.log("Participar do grupo"),
        },
      ],
      justification:
        "Estudar em grupo pode aumentar significativamente sua compreensão e retenção do conteúdo. Este grupo específico está discutindo tópicos relacionados à sua próxima avaliação de Biologia, e participar pode ajudá-lo a esclarecer dúvidas e aprender novas perspectivas.",
      showJustification: false,
    },
    {
      id: "7",
      priority: "medium",
      type: "event",
      title: "Palestra sobre Inteligência Artificial amanhã às 14:00",
      description:
        "Um evento que pode complementar seus estudos de Computação.",
      discipline: "Computação",
      icon: <Calendar className="h-5 w-5 text-indigo-500" />,
      actions: [
        {
          label: "Ver Detalhes",
          icon: <ExternalLink className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
          action: () => console.log("Ver detalhes do evento"),
        },
        {
          label: "Adicionar ao Calendário",
          icon: <Calendar className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
          action: () => console.log("Adicionar ao calendário"),
        },
      ],
      justification:
        "Esta palestra aborda temas relacionados ao seu curso de Computação e pode oferecer insights valiosos sobre aplicações práticas de Inteligência Artificial. O palestrante é um especialista reconhecido na área, e o evento inclui uma sessão de perguntas e respostas que pode ajudar a esclarecer suas dúvidas.",
      showJustification: false,
    },
    {
      id: "8",
      priority: "low",
      type: "challenge",
      title: "Desafio da semana: Resolva 10 exercícios de Álgebra Linear",
      description: "Complete o desafio e ganhe 50 pontos de experiência!",
      discipline: "Matemática",
      icon: <Target className="h-5 w-5 text-rose-500" />,
      actions: [
        {
          label: "Aceitar Desafio",
          icon: <Lightbulb className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
          action: () => console.log("Aceitar desafio"),
        },
      ],
      justification:
        "Os desafios semanais são projetados para incentivar a prática regular e aprofundar seu conhecimento em áreas específicas. Este desafio de Álgebra Linear foi selecionado com base em seu histórico de estudos e pode ajudar a fortalecer conceitos importantes para seu curso atual.",
      showJustification: false,
    },
  ]);

  const toggleJustification = (id: string) => {
    setSuggestions(
      suggestions.map((suggestion) =>
        suggestion.id === id
          ? {
              ...suggestion,
              showJustification: !suggestion.showJustification,
            }
          : suggestion,
      ),
    );
  };

  const handleFeedback = (id: string, isPositive: boolean) => {
    // In a real application, this would send feedback to the server
    console.log(
      `Feedback for suggestion ${id}: ${isPositive ? "positive" : "negative"}`,
    );

    // Remove the suggestion after feedback
    setSuggestions(suggestions.filter((suggestion) => suggestion.id !== id));
  };

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Alta Prioridade
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            Média Prioridade
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Baixa Prioridade
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
              Sugestões do Epictus IA
            </DialogTitle>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Recomendações personalizadas baseadas no seu desempenho e objetivos
            de aprendizagem.
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-white dark:bg-[#1E293B] rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex-shrink-0">{suggestion.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {suggestion.title}
                      </h4>
                      {getPriorityBadge(suggestion.priority)}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {suggestion.description}
                    </p>

                    {suggestion.discipline && (
                      <Badge
                        variant="outline"
                        className="mt-2 text-xs border-[#FF6B00]/30 bg-transparent text-[#FF6B00]"
                      >
                        {suggestion.discipline}
                      </Badge>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {suggestion.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant={action.variant}
                          onClick={action.action}
                          className={
                            action.variant === "outline"
                              ? "h-8 text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-medium flex items-center rounded-lg transition-colors"
                              : "h-8 text-xs bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium flex items-center rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                          }
                        >
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleJustification(suggestion.id)}
                        className="h-8 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {suggestion.showJustification
                          ? "Ocultar detalhes"
                          : "Ver detalhes"}
                      </Button>
                    </div>

                    {suggestion.showJustification &&
                      suggestion.justification && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md text-xs text-gray-600 dark:text-gray-300">
                          <p>{suggestion.justification}</p>
                        </div>
                      )}

                    <div className="flex justify-end mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFeedback(suggestion.id, true)}
                          className="h-7 w-7 p-0 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                          title="Útil"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFeedback(suggestion.id, false)}
                          className="h-7 w-7 p-0 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Não útil"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma sugestão no momento
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                O Epictus IA está analisando seu desempenho e atividades para
                gerar recomendações personalizadas. Volte mais tarde para ver
                novas sugestões.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpictusAISuggestionsModal;
