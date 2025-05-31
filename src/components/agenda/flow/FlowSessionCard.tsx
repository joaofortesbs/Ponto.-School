
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  BookOpen,
  Target,
  Trophy,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useFlowSessions from "@/hooks/useFlowSessions";

const FlowSessionCard: React.FC = () => {
  // Estados do timer
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Estados da sessão
  const [sessionTitle, setSessionTitle] = useState("Sessão de Estudo");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [sessionGoal, setSessionGoal] = useState("");
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  
  // Estados da interface
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Hook para gerenciar sessões
  const { addSession, sessions, loading } = useFlowSessions();
  
  // Referência para o interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Formatar tempo
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Iniciar timer
  const startTimer = () => {
    if (!isRunning && !isPaused) {
      setStartTime(new Date());
    }
    setIsRunning(true);
    setIsPaused(false);
    
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  // Pausar timer
  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Parar e finalizar sessão
  const stopTimer = async () => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (elapsedTime > 0) {
      setIsCompleting(true);
      
      // Calcular XP baseado no tempo de estudo
      const xpEarned = Math.floor(elapsedTime / 60); // 1 XP por minuto
      
      // Criar objeto da sessão
      const session = {
        id: Date.now().toString(),
        timestamp: startTime?.getTime() || Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        duration: formatTime(elapsedTime),
        elapsedTimeSeconds: elapsedTime,
        subjects: subjects,
        progress: progress,
        notes: notes,
        xp: xpEarned,
        session_title: sessionTitle
      };
      
      // Salvar sessão
      const success = await addSession(session);
      
      if (success) {
        console.log('Sessão de Flow salva com sucesso!');
        
        // Resetar estados
        resetSession();
      } else {
        console.error('Erro ao salvar sessão');
      }
      
      setIsCompleting(false);
    }
  };

  // Resetar sessão
  const resetSession = () => {
    setElapsedTime(0);
    setStartTime(null);
    setProgress(0);
    setNotes("");
    setSessionTitle("Sessão de Estudo");
    setSubjects([]);
    setSessionGoal("");
    setShowConfig(false);
  };

  // Adicionar matéria
  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  // Remover matéria
  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  // Cleanup do interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
          <Clock className="h-6 w-6 text-blue-600" />
          Flow Session
        </CardTitle>
        
        {!showConfig ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {sessionTitle}
            </h3>
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {subjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <div>
              <Label htmlFor="session-title">Título da Sessão</Label>
              <Input
                id="session-title"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Nome da sua sessão"
              />
            </div>
            
            <div>
              <Label htmlFor="session-goal">Objetivo da Sessão</Label>
              <Input
                id="session-goal"
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                placeholder="O que você quer alcançar?"
              />
            </div>
            
            <div>
              <Label>Matérias/Tópicos</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Adicionar matéria"
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                />
                <Button onClick={addSubject} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {subjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeSubject(subject)}>
                    {subject} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-gray-800 dark:text-white mb-2">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isRunning ? "Em andamento" : isPaused ? "Pausado" : "Parado"}
          </div>
        </div>

        {/* Progress */}
        {(isRunning || isPaused) && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Progresso da Sessão</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <Input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Notes */}
        {(isRunning || isPaused) && (
          <div className="space-y-2">
            <Label htmlFor="notes">Anotações da Sessão</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anote seus insights, dificuldades ou conquistas..."
              className="min-h-[80px]"
            />
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2 justify-center">
          {!isRunning && !isPaused ? (
            <>
              <Button
                onClick={() => setShowConfig(!showConfig)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Target className="h-4 w-4 mr-2" />
                {showConfig ? "Ocultar" : "Configurar"}
              </Button>
              <Button
                onClick={startTimer}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isCompleting}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={isRunning ? pauseTimer : startTimer}
                variant="outline"
                size="sm"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                onClick={stopTimer}
                variant="destructive"
                size="sm"
                disabled={isCompleting}
              >
                <Square className="h-4 w-4 mr-2" />
                {isCompleting ? "Salvando..." : "Finalizar"}
              </Button>
              <Button
                onClick={resetSession}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sessions.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Sessões Totais
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.floor(elapsedTime / 60) || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              XP desta sessão
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlowSessionCard;
