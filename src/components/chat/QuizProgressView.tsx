
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { QuizAttempt, QuizProgress } from "@/types/quiz-history";
import { getQuizHistory, analyzeQuizProgress } from "@/services/quizHistoryService";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, BookOpenIcon, CalendarIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

export default function QuizProgressView() {
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [uniqueThemes, setUniqueThemes] = useState<string[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (selectedTheme) {
      analyzeProgress(selectedTheme);
    }
  }, [selectedTheme]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const attempts = await getQuizHistory();
      setHistory(attempts);
      
      // Extrair temas únicos
      const themes = [...new Set(attempts.map(a => a.theme))];
      setUniqueThemes(themes);
      
      // Selecionar o primeiro tema se existir
      if (themes.length > 0 && !selectedTheme) {
        setSelectedTheme(themes[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProgress = async (theme: string) => {
    try {
      const progressData = await analyzeQuizProgress(theme);
      setProgress(progressData);
    } catch (error) {
      console.error("Erro ao analisar progresso:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const calculateSuccessRate = (correct: number, total: number) => {
    return Math.round((correct / total) * 100);
  };

  const getEvolutionIcon = () => {
    if (!progress?.evolution) return null;
    
    switch (progress.evolution.trend) {
      case 'up':
        return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <MinusIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getEvolutionText = () => {
    if (!progress?.evolution) return "Sem dados suficientes";
    
    const { trend, percentage } = progress.evolution;
    switch (trend) {
      case 'up':
        return `Melhorando ${percentage}%`;
      case 'down':
        return `Piorou ${percentage}%`;
      default:
        return "Desempenho estável";
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meu Progresso</h2>
        <Button variant="outline" onClick={loadHistory} disabled={loading}>
          {loading ? "Carregando..." : "Atualizar"}
        </Button>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookOpenIcon className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-center text-gray-500">
              Você ainda não realizou nenhuma tentativa de quiz ou prova.
              <br />
              Complete um quiz para ver seu progresso aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {uniqueThemes.map((theme) => (
              <Badge 
                key={theme} 
                variant={selectedTheme === theme ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTheme(theme)}
              >
                {theme}
              </Badge>
            ))}
          </div>

          {progress && (
            <Card className="mb-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedTheme}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getEvolutionIcon()}
                    <span className="text-sm font-medium">{getEvolutionText()}</span>
                  </div>
                </div>
                <CardDescription>
                  {progress.attempts.length} {progress.attempts.length === 1 ? 'tentativa' : 'tentativas'} realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="history">
                  <TabsList className="mb-4">
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                    <TabsTrigger value="analytics">Análise</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="history">
                    <div className="space-y-4">
                      {progress.attempts.map((attempt) => (
                        <Card key={attempt.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">
                                {attempt.type} - {attempt.theme}
                              </CardTitle>
                              <Badge variant={attempt.type === 'Quiz' ? "default" : "secondary"}>
                                {attempt.type}
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {formatDate(attempt.date)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Taxa de acerto:</span>
                                <span className="font-medium">
                                  {attempt.correctAnswers} de {attempt.totalQuestions} ({calculateSuccessRate(attempt.correctAnswers, attempt.totalQuestions)}%)
                                </span>
                              </div>
                              <Progress value={calculateSuccessRate(attempt.correctAnswers, attempt.totalQuestions)} />
                              
                              <div className="flex flex-wrap gap-1 mt-2">
                                {attempt.settings.studyMode && (
                                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                                    Modo Estudo
                                  </Badge>
                                )}
                                {attempt.settings.smartDifficulty && (
                                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
                                    Dificuldade Inteligente
                                  </Badge>
                                )}
                                {attempt.bnccCompetence && (
                                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                                    BNCC: {attempt.bnccCompetence}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Evolução de desempenho</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {progress.attempts.length >= 2 ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Primeira tentativa</span>
                                    <span>{calculateSuccessRate(
                                      progress.attempts[progress.attempts.length-1].correctAnswers, 
                                      progress.attempts[progress.attempts.length-1].totalQuestions
                                    )}%</span>
                                  </div>
                                  <Progress value={calculateSuccessRate(
                                    progress.attempts[progress.attempts.length-1].correctAnswers, 
                                    progress.attempts[progress.attempts.length-1].totalQuestions
                                  )} />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Última tentativa</span>
                                    <span>{calculateSuccessRate(
                                      progress.attempts[0].correctAnswers, 
                                      progress.attempts[0].totalQuestions
                                    )}%</span>
                                  </div>
                                  <Progress value={calculateSuccessRate(
                                    progress.attempts[0].correctAnswers, 
                                    progress.attempts[0].totalQuestions
                                  )} />
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                {getEvolutionIcon()}
                                <span>{getEvolutionText()} em relação às tentativas anteriores</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <p className="text-center text-gray-500">
                                Realize mais tentativas para ver uma análise detalhada.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Estatísticas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <CheckCircleIcon className="h-8 w-8 text-green-500 mb-2" />
                              <span className="text-2xl font-bold">
                                {calculateSuccessRate(
                                  progress.attempts.reduce((sum, a) => sum + a.correctAnswers, 0),
                                  progress.attempts.reduce((sum, a) => sum + a.totalQuestions, 0)
                                )}%
                              </span>
                              <span className="text-sm text-gray-500">Taxa média de acerto</span>
                            </div>
                            
                            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <ClockIcon className="h-8 w-8 text-blue-500 mb-2" />
                              <span className="text-2xl font-bold">
                                {progress.attempts.length}
                              </span>
                              <span className="text-sm text-gray-500">Tentativas realizadas</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
