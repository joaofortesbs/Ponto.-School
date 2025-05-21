
import React, { useState, useEffect } from "react";
import { Sparkles, AlertCircle, Award, Activity, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import useFlowSessions from "@/hooks/useFlowSessions";
import { getEventsByUserId } from "@/services/calendarEventService";
import { generateAIResponse } from "@/services/epictusIAService";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

// Tipagem para recomendações
interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  icon: React.ReactNode;
  actions: {
    label: string;
    icon?: React.ReactNode;
    variant: "primary" | "secondary";
    onClick: () => void;
  }[];
}

const RecomendacoesEpictusIA = () => {
  const { user } = useAuth();
  const { sessions, getStats } = useFlowSessions();
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeFilter, setActiveFilter] = useState<"semana" | "mes" | "ano">("semana");

  // Função para carregar eventos do calendário
  const loadCalendarEvents = async () => {
    if (!user?.id) return;

    try {
      const events = await getEventsByUserId(user.id);
      setCalendarEvents(events);
      return events;
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      return [];
    }
  };

  // Função para gerar recomendações baseadas nos dados do usuário
  const generateRecommendations = async (flowStats: any, events: any[]) => {
    if (!user?.id) return;

    try {
      // Preparar dados para enviar à API Gemini
      const totalStudyTimeHours = (flowStats.totalTimeInSeconds / 3600).toFixed(1);
      const avgEfficiency = flowStats.avgEfficiency;
      const sessionsCount = flowStats.sessionsCount;
      const subjectDistribution = Object.entries(flowStats.subjectStats)
        .map(([subject, seconds]) => `${subject}: ${(Number(seconds) / 3600).toFixed(1)} horas`)
        .join(', ');

      // Eventos próximos (próximos 7 dias)
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const upcomingEvents = events
        .filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= now && eventDate <= nextWeek;
        })
        .map(event => ({
          title: event.title,
          date: event.startDate,
          type: event.type,
          discipline: event.discipline || 'Não especificada'
        }));

      // Montar prompt para a API Gemini
      const prompt = `
        Como especialista em educação e produtividade, analise os dados de estudo deste usuário e gere 3 recomendações personalizadas.
        
        Dados de estudo do usuário nos últimos 30 dias:
        - Tempo total de estudo: ${totalStudyTimeHours} horas
        - Eficiência média: ${avgEfficiency}%
        - Número de sessões: ${sessionsCount}
        - Distribuição por disciplina: ${subjectDistribution || "Sem dados suficientes"}
        
        Eventos próximos do calendário:
        ${upcomingEvents.length > 0 
          ? upcomingEvents.map(e => `- ${e.title} (${e.date}) - ${e.discipline}`).join('\n') 
          : "Nenhum evento próximo encontrado"}
        
        Gere uma resposta no formato JSON com a seguinte estrutura:
        [
          {
            "id": "1",
            "priority": "high/medium/low",
            "title": "Título da recomendação (máx 60 caracteres)",
            "description": "Descrição detalhada (máx 120 caracteres)",
            "actions": [
              {
                "label": "Ação principal",
                "type": "primary"
              },
              {
                "label": "Ação secundária",
                "type": "secondary"
              }
            ]
          },
          ...
        ]
        
        As prioridades devem ser baseadas na urgência dos eventos e nas necessidades de estudo.
        Gere apenas o JSON sem explicações adicionais.
      `;

      // Fazer requisição para a API Gemini
      const responseText = await generateAIResponse(prompt);
      
      try {
        // Extrair apenas o JSON da resposta (caso a API retorne texto adicional)
        const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : responseText;
        
        const parsedRecommendations = JSON.parse(jsonString);
        
        // Converter para o formato interno
        const formattedRecommendations = parsedRecommendations.map((rec: any, index: number) => {
          // Determinar o ícone com base na prioridade
          let icon;
          if (rec.priority === "high") {
            icon = <AlertCircle className="h-5 w-5 text-red-500" />;
          } else if (rec.priority === "medium") {
            icon = <Award className="h-5 w-5 text-amber-500" />;
          } else {
            icon = <Activity className="h-5 w-5 text-green-500" />;
          }
          
          return {
            id: rec.id || `rec-${index}`,
            priority: rec.priority,
            title: rec.title,
            description: rec.description,
            icon: icon,
            actions: rec.actions.map((action: any) => ({
              label: action.label,
              variant: action.type === "primary" ? "primary" : "secondary",
              onClick: () => console.log(`Ação clicada: ${action.label}`)
            }))
          };
        });
        
        setRecommendations(formattedRecommendations);
      } catch (error) {
        console.error("Erro ao processar JSON da IA:", error);
        // Fallback para recomendações padrão em caso de erro
        setRecommendations(generateFallbackRecommendations());
      }
    } catch (error) {
      console.error("Erro ao gerar recomendações:", error);
      setRecommendations(generateFallbackRecommendations());
    } finally {
      setLoading(false);
    }
  };

  // Recomendações de fallback para quando não há dados suficientes
  const generateFallbackRecommendations = (): Recommendation[] => {
    return [
      {
        id: "fallback-1",
        priority: "medium",
        title: "Comece seu registro de estudos",
        description: "Use o Epictus Flow para registrar seu tempo de estudo e aumentar sua produtividade.",
        icon: <Activity className="h-5 w-5 text-green-500" />,
        actions: [
          {
            label: "Iniciar Flow",
            variant: "primary",
            onClick: () => window.location.href = "/agenda?tab=flow"
          }
        ]
      }
    ];
  };

  // Efeito para carregar dados e gerar recomendações
  useEffect(() => {
    const fetchDataAndGenerateRecommendations = async () => {
      setLoading(true);
      
      const events = await loadCalendarEvents();
      const stats = getStats();
      
      // Verificar se existem dados suficientes
      if ((sessions.length === 0 || stats.totalTimeInSeconds === 0) && (!events || events.length === 0)) {
        setRecommendations(generateFallbackRecommendations());
        setLoading(false);
        return;
      }
      
      await generateRecommendations(stats, events || []);
    };

    fetchDataAndGenerateRecommendations();
  }, [user?.id, sessions, activeFilter]);

  const getPriorityBgColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 dark:bg-red-900/20";
      case "medium":
        return "bg-amber-500/10 dark:bg-amber-900/20";
      case "low":
        return "bg-green-500/10 dark:bg-green-900/20";
      default:
        return "bg-blue-500/10 dark:bg-blue-900/20";
    }
  };

  const getPriorityBorderColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "border-red-500/20 dark:border-red-500/30";
      case "medium":
        return "border-amber-500/20 dark:border-amber-500/30";
      case "low":
        return "border-green-500/20 dark:border-green-500/30";
      default:
        return "border-blue-500/20 dark:border-blue-500/30";
    }
  };

  const getActionButtonClass = (variant: string): string => {
    return variant === "primary" 
      ? "bg-[#FF6B00] hover:bg-[#FF8C40] text-white" 
      : "bg-[#29335C] hover:bg-[#29335C]/80 text-white";
  };

  return (
    <div className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gradient-to-b dark:from-[#001427] dark:to-[#001a2f] rounded-xl">
      {/* Cabeçalho estilizado como o do card Tempo de Estudo */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Recomendações do Epictus IA</h3>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${activeFilter === 'semana' ? 'bg-white/20 font-medium' : 'hover:bg-white/30'}`}
            onClick={() => setActiveFilter('semana')}
          >
            Semana
          </span>
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${activeFilter === 'mes' ? 'bg-white/20 font-medium' : 'hover:bg-white/30'}`}
            onClick={() => setActiveFilter('mes')}
          >
            Mês
          </span>
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${activeFilter === 'ano' ? 'bg-white/20 font-medium' : 'hover:bg-white/30'}`}
            onClick={() => setActiveFilter('ano')}
          >
            Ano
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {loading ? (
          // Esqueleto de carregamento
          <>
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-8 w-24 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-8 w-24 bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-8 w-24 bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </>
        ) : recommendations.length > 0 ? (
          // Recomendações
          <>
            {recommendations.map((recommendation) => (
              <div 
                key={recommendation.id}
                className={`p-4 rounded-lg border ${getPriorityBorderColor(recommendation.priority)} ${getPriorityBgColor(recommendation.priority)}`}
              >
                <div className="flex items-start gap-3">
                  {recommendation.icon}
                  <div className="space-y-2 flex-1">
                    <h4 className="text-[#29335C] dark:text-white font-medium">{recommendation.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {recommendation.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recommendation.actions.map((action, idx) => (
                        <Button 
                          key={idx}
                          onClick={action.onClick}
                          className={`text-xs py-1 h-8 flex items-center gap-1 ${getActionButtonClass(action.variant)}`}
                        >
                          {action.icon}
                          <span>{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          // Mensagem quando não há recomendações
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-[#29335C] dark:text-white font-medium">Sem recomendações disponíveis</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Comece a registrar suas sessões de estudo para receber recomendações personalizadas
            </p>
          </div>
        )}
        
        {/* Botão Ver mais */}
        <div className="mt-4">
          <Button 
            variant="outline" 
            className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            onClick={() => window.location.href = "/epictus-ia"}
          >
            <ExternalLink className="h-3 w-3 mr-2" /> Ver todas as recomendações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecomendacoesEpictusIA;
