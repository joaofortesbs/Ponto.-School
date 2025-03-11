import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  BookOpenCheck,
  Brain,
  Clock,
  FileText,
  Headphones,
  Lightbulb,
  List,
  Maximize2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  StopCircle,
  Target,
  Trash,
  Volume2,
  X,
  Zap,
} from "lucide-react";

const FlowSessionCard: React.FC = () => {
  const [sessionState, setSessionState] = useState<
    "idle" | "preparing" | "active" | "paused" | "completed"
  >("idle");
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [sessionGoal, setSessionGoal] = useState("");
  const [plannedDuration, setPlannedDuration] = useState(60); // in minutes
  const [currentTab, setCurrentTab] = useState("prepare");
  const [notes, setNotes] = useState("");
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectIcon, setNewSubjectIcon] = useState("📚");
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialType, setNewMaterialType] = useState("book");
  const [customMaterials, setCustomMaterials] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [dailyTasks, setDailyTasks] = useState<
    { id: string; title: string; completed: boolean; subject: string }[]
  >([
    {
      id: "task1",
      title: "Resolver exercícios de Matemática",
      completed: false,
      subject: "math",
    },
    {
      id: "task2",
      title: "Ler capítulo 5 de Química",
      completed: false,
      subject: "chemistry",
    },
    {
      id: "task3",
      title: "Revisar anotações de Física",
      completed: false,
      subject: "physics",
    },
  ]);

  // Format time as HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (plannedDuration === 0) return 0;
    const progress = (elapsedTime / (plannedDuration * 60)) * 100;
    return Math.min(progress, 100);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  // Handle start session
  const startSession = () => {
    setSessionState("active");
    setCurrentTab("session");

    // Start the timer
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    setTimer(interval);
  };

  // Handle pause session
  const pauseSession = () => {
    setSessionState("paused");

    // Pause the timer
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  // Handle resume session
  const resumeSession = () => {
    setSessionState("active");

    // Resume the timer
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    setTimer(interval);
  };

  // Handle end session
  const endSession = () => {
    setSessionState("completed");
    setCurrentTab("summary");

    // Stop the timer
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  // Handle reset session
  const resetSession = () => {
    setSessionState("idle");
    setElapsedTime(0);
    setSelectedSubjects([]);
    setFocusMode(false);
    setSessionGoal("");
    setPlannedDuration(60);
    setCurrentTab("prepare");
    setNotes("");

    // Stop the timer if it's running
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    // Reset daily tasks completion status
    setDailyTasks(dailyTasks.map((task) => ({ ...task, completed: false })));
  };

  // Add new subject
  const addNewSubject = () => {
    if (newSubjectName.trim() === "") return;

    const newSubjectId = `custom-${Date.now()}`;
    const newSubject = {
      id: newSubjectId,
      name: newSubjectName,
      icon: <span className="text-[#FF6B00] font-bold">{newSubjectIcon}</span>,
    };

    // Create a new array with all existing subjects plus the new one
    const updatedSubjects = [...subjects, newSubject];

    // Replace the subjects reference with the new array
    // @ts-ignore - This is a workaround for the mutable subjects array
    subjects.splice(0, subjects.length, ...updatedSubjects);

    setSelectedSubjects([...selectedSubjects, newSubjectId]);
    setNewSubjectName("");
    setNewSubjectIcon("📚");
    setShowAddSubjectModal(false);
  };

  // Add new material
  const addNewMaterial = () => {
    if (newMaterialName.trim() === "") return;

    const newMaterial = {
      id: `custom-material-${Date.now()}`,
      name: newMaterialName,
      type: newMaterialType,
    };

    setCustomMaterials([...customMaterials, newMaterial]);
    setNewMaterialName("");
    setNewMaterialType("book");
    setShowAddMaterialModal(false);
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setDailyTasks(
      dailyTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  // Sample subjects
  const subjects = [
    {
      id: "math",
      name: "Matemática",
      icon: <span className="text-[#FF6B00] font-bold">π</span>,
    },
    {
      id: "physics",
      name: "Física",
      icon: <span className="text-[#FF8C40] font-bold">⚛</span>,
    },
    {
      id: "chemistry",
      name: "Química",
      icon: <span className="text-[#E85D04] font-bold">⚗</span>,
    },
    {
      id: "biology",
      name: "Biologia",
      icon: <span className="text-[#DC2F02] font-bold">🧬</span>,
    },
    {
      id: "history",
      name: "História",
      icon: <span className="text-[#9D0208] font-bold">📜</span>,
    },
  ];

  // Sample materials
  const materials = [
    { id: "textbook", name: "Livro Didático", type: "book" },
    { id: "video", name: "Videoaulas", type: "video" },
    { id: "exercises", name: "Lista de Exercícios", type: "exercise" },
    { id: "notes", name: "Anotações de Aula", type: "notes" },
  ];

  // Sample mentor tips
  const mentorTips = [
    "Lembre-se de fazer pausas curtas a cada 25 minutos de estudo intenso.",
    "Revisar o conteúdo estudado antes de dormir ajuda na memorização.",
    "Tente explicar o que você aprendeu como se estivesse ensinando alguém.",
    "Alternar entre diferentes assuntos pode melhorar a retenção de informações.",
  ];

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md p-6 mb-6 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-[#FF6B00]" />
            <h3 className="text-xl font-bold text-[#29335C] dark:text-white">
              Flow de Aprendizagem
            </h3>
          </div>

          {sessionState === "active" && (
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white animate-pulse">
                Em andamento
              </Badge>
              <div className="text-2xl font-bold text-[#FF6B00]">
                {formatTime(elapsedTime)}
              </div>
            </div>
          )}

          {sessionState === "paused" && (
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500 text-white">Pausado</Badge>
              <div className="text-2xl font-bold text-[#FF6B00]">
                {formatTime(elapsedTime)}
              </div>
            </div>
          )}

          {sessionState === "idle" && currentTab !== "summary" && (
            <TabsList className="bg-[#29335C]/10 dark:bg-[#29335C]/30 p-1 rounded-lg">
              <TabsTrigger
                value="prepare"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-3 py-1 text-sm font-medium"
              >
                Preparar
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-3 py-1 text-sm font-medium"
              >
                Histórico
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-3 py-1 text-sm font-medium"
              >
                Estatísticas
              </TabsTrigger>
            </TabsList>
          )}
        </div>

        {/* Prepare Tab */}
        <TabsContent value="prepare" className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#29335C] dark:text-white mb-2">
              Prepare sua sessão de estudo
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Configure sua sessão para maximizar seu foco e produtividade. O
              Epictus IA irá te acompanhar durante todo o processo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
                <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                  Selecione as disciplinas
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${selectedSubjects.includes(subject.id) ? "bg-[#FF6B00]/10 border border-[#FF6B00]/30" : "bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30"}`}
                      onClick={() => {
                        if (selectedSubjects.includes(subject.id)) {
                          setSelectedSubjects(
                            selectedSubjects.filter((id) => id !== subject.id),
                          );
                        } else {
                          setSelectedSubjects([
                            ...selectedSubjects,
                            subject.id,
                          ]);
                        }
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F8F9FA] dark:bg-[#29335C] flex items-center justify-center">
                        {subject.icon}
                      </div>
                      <span className="text-sm font-medium text-[#29335C] dark:text-white">
                        {subject.name}
                      </span>
                    </div>
                  ))}
                  <div
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all bg-white dark:bg-[#1E293B] border border-dashed border-[#FF6B00]/30 hover:bg-[#FF6B00]/5 dark:hover:bg-[#FF6B00]/10"
                    onClick={() => setShowAddSubjectModal(true)}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F8F9FA] dark:bg-[#29335C] flex items-center justify-center">
                      <Plus className="h-4 w-4 text-[#FF6B00]" />
                    </div>
                    <span className="text-sm font-medium text-[#FF6B00]">
                      Adicionar disciplina
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
                <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-[#FF6B00]" />
                  Defina sua meta
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
                      O que você quer alcançar nesta sessão?
                    </label>
                    <Textarea
                      placeholder="Ex: Resolver 10 exercícios de matemática, Ler 3 capítulos do livro..."
                      className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 text-sm"
                      value={sessionGoal}
                      onChange={(e) => setSessionGoal(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
                      Duração planejada (minutos)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="5"
                        max="240"
                        className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                        value={plannedDuration}
                        onChange={(e) =>
                          setPlannedDuration(parseInt(e.target.value) || 60)
                        }
                      />
                      <div className="flex gap-1">
                        {[30, 60, 90, 120].map((duration) => (
                          <Button
                            key={duration}
                            variant="outline"
                            size="sm"
                            className={`h-8 px-2 text-xs ${plannedDuration === duration ? "bg-[#FF6B00] text-white border-[#FF6B00]" : "border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"}`}
                            onClick={() => setPlannedDuration(duration)}
                          >
                            {duration}m
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
                <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-[#FF6B00]" />
                  Materiais de estudo
                </h4>
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 cursor-pointer transition-all"
                    >
                      <Checkbox
                        id={`material-${material.id}`}
                        className="border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                      />
                      <label
                        htmlFor={`material-${material.id}`}
                        className="flex-1 text-sm font-medium text-[#29335C] dark:text-white cursor-pointer"
                      >
                        {material.name}
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-500 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {customMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 cursor-pointer transition-all"
                    >
                      <Checkbox
                        id={`material-${material.id}`}
                        className="border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                      />
                      <label
                        htmlFor={`material-${material.id}`}
                        className="flex-1 text-sm font-medium text-[#29335C] dark:text-white cursor-pointer"
                      >
                        {material.name}
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-500 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
                        onClick={() =>
                          setCustomMaterials(
                            customMaterials.filter((m) => m.id !== material.id),
                          )
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-dashed border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    onClick={() => setShowAddMaterialModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar material
                  </Button>
                </div>
              </div>

              <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
                <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-[#FF6B00]" />
                  Configurações avançadas
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Maximize2 className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm text-[#29335C] dark:text-white">
                        Modo Foco
                      </span>
                    </div>
                    <Checkbox
                      id="focus-mode"
                      checked={focusMode}
                      onCheckedChange={(checked) =>
                        setFocusMode(checked as boolean)
                      }
                      className="border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm text-[#29335C] dark:text-white">
                        Som ambiente
                      </span>
                    </div>
                    <Select defaultValue="none">
                      <SelectTrigger className="w-[140px] h-8 text-xs border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        <SelectItem value="nature">Sons da Natureza</SelectItem>
                        <SelectItem value="rain">Chuva</SelectItem>
                        <SelectItem value="cafe">Café</SelectItem>
                        <SelectItem value="lofi">Lo-Fi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm text-[#29335C] dark:text-white">
                        Assistência do Epictus IA
                      </span>
                    </div>
                    <Select defaultValue="medium">
                      <SelectTrigger className="w-[140px] h-8 text-xs border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Desativado</SelectItem>
                        <SelectItem value="low">Mínima</SelectItem>
                        <SelectItem value="medium">Moderada</SelectItem>
                        <SelectItem value="high">Intensiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mentor Tip */}
          <div className="bg-gradient-to-r from-[#001427] to-[#29335C] text-white p-4 rounded-lg border border-[#FF6B00]/30 flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-[#FF6B00]" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white flex items-center gap-2 mb-1">
                <span>Dica do Epictus IA</span>
                <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] text-xs">
                  Novo
                </Badge>
              </h4>
              <p className="text-sm text-gray-300">
                {mentorTips[Math.floor(Math.random() * mentorTips.length)]}
              </p>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-center pt-4">
            <Button
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-8 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={startSession}
              disabled={selectedSubjects.length === 0}
            >
              <Play className="h-5 w-5 mr-2" /> Iniciar Sessão de Estudo
            </Button>
          </div>
        </TabsContent>

        {/* Session Tab */}
        <TabsContent value="session" className="space-y-6">
          {sessionState === "active" || sessionState === "paused" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Timer */}
              <div className="md:col-span-1">
                <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10 flex flex-col items-center">
                  <div className="w-48 h-48 relative flex items-center justify-center mb-4">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200 dark:text-gray-700"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-[#FF6B00]"
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - calculateProgress() / 100)}`}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-[#FF6B00]">
                        {formatTime(elapsedTime)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Meta: {plannedDuration} min
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {sessionState === "active" ? (
                      <Button
                        variant="outline"
                        className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                        onClick={pauseSession}
                      >
                        <Pause className="h-4 w-4 mr-1" /> Pausar
                      </Button>
                    ) : (
                      <Button
                        className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                        onClick={resumeSession}
                      >
                        <Play className="h-4 w-4 mr-1" /> Continuar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                      onClick={endSession}
                    >
                      <StopCircle className="h-4 w-4 mr-1" /> Finalizar
                    </Button>
                  </div>

                  <div className="w-full space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>{Math.round(calculateProgress())}%</span>
                      </div>
                      <Progress
                        value={calculateProgress()}
                        className="h-2 bg-[#FF6B00]/10"
                      />
                    </div>

                    <div className="bg-[#001427] text-white p-3 rounded-lg">
                      <h5 className="font-medium text-sm flex items-center gap-1 mb-2">
                        <Target className="h-3.5 w-3.5 text-[#FF6B00]" /> Meta
                        da sessão
                      </h5>
                      <p className="text-xs text-gray-300">
                        {sessionGoal || "Nenhuma meta definida"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Current Subject */}
              <div className="md:col-span-1">
                <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10 h-full flex flex-col">
                  <div className="flex-none">
                    <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                      Disciplina Atual
                    </h4>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {selectedSubjects.map((subjectId) => {
                        const subject = subjects.find(
                          (s) => s.id === subjectId,
                        );
                        return (
                          <div
                            key={subjectId}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 cursor-pointer transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#F8F9FA] dark:bg-[#29335C] flex items-center justify-center">
                              {subject?.icon}
                            </div>
                            <span className="text-sm font-medium text-[#29335C] dark:text-white">
                              {subject?.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-none mb-4">
                    <h5 className="font-medium text-sm text-[#29335C] dark:text-white flex items-center gap-2 mb-2">
                      <CheckSquare className="h-4 w-4 text-[#FF6B00]" />
                      Tarefas do Dia
                    </h5>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {dailyTasks
                        .filter((task) =>
                          selectedSubjects.some((s) => s === task.subject),
                        )
                        .map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-2 p-2 bg-white dark:bg-[#1E293B] rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <Checkbox
                              id={`task-${task.id}`}
                              checked={task.completed}
                              onCheckedChange={() =>
                                toggleTaskCompletion(task.id)
                              }
                              className="mt-0.5 border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                            />
                            <label
                              htmlFor={`task-${task.id}`}
                              className={`text-sm ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-[#29335C] dark:text-white"}`}
                            >
                              {task.title}
                            </label>
                          </div>
                        ))}
                      {dailyTasks.filter((task) =>
                        selectedSubjects.some((s) => s === task.subject),
                      ).length === 0 && (
                        <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                          Nenhuma tarefa para as disciplinas selecionadas
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h5 className="font-medium text-sm text-[#29335C] dark:text-white mb-2">
                      Anotações
                    </h5>
                    <Textarea
                      placeholder="Faça suas anotações aqui..."
                      className="flex-1 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 text-sm resize-none"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Epictus IA */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-br from-[#001427] to-[#29335C] text-white rounded-lg p-4 border border-[#FF6B00]/30 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <Brain className="h-4 w-4 text-[#FF6B00]" />
                      Epictus IA
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mt-0.5">
                          <Brain className="h-4 w-4 text-[#FF6B00]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-200">
                            Você está indo bem! Já completou{" "}
                            {Math.round(calculateProgress())}% da sua sessão
                            planejada.
                          </p>
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-white/20 text-white hover:bg-white/10"
                            >
                              Preciso de ajuda
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                            >
                              Obrigado!
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mt-0.5">
                          <Lightbulb className="h-4 w-4 text-[#FF6B00]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-200">
                            Dica: Tente usar a técnica Pomodoro - 25 minutos de
                            estudo intenso seguidos de 5 minutos de descanso.
                          </p>
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-white/20 text-white hover:bg-white/10"
                            >
                              Mais dicas
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="relative">
                      <Input
                        placeholder="Pergunte ao Epictus IA..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nenhuma sessão ativa
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Inicie uma sessão de estudo para acompanhar seu progresso.
              </p>
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                onClick={() => {
                  setCurrentTab("prepare");
                }}
              >
                <Play className="h-4 w-4 mr-1" /> Preparar Sessão
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          {sessionState === "completed" ? (
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#29335C] dark:text-white mb-2">
                Sessão de estudo concluída!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Parabéns! Você completou sua sessão de estudo. Veja abaixo um
                resumo do seu desempenho.
              </p>
            </div>
          ) : (
            <div className="text-center p-8">
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nenhuma sessão concluída
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Complete uma sessão de estudo para ver o resumo.
              </p>
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                onClick={() => {
                  setCurrentTab("prepare");
                }}
              >
                <Play className="h-4 w-4 mr-1" /> Preparar Sessão
              </Button>
            </div>
          )}

          {sessionState === "completed" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
                  <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-[#FF6B00]" />
                    Resumo da sessão
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#1E293B] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Tempo total
                      </div>
                      <div className="text-xl font-bold text-[#FF6B00]">
                        {formatTime(elapsedTime)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1E293B] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Meta atingida
                      </div>
                      <div className="text-xl font-bold text-[#FF6B00]">
                        {Math.min(100, Math.round(calculateProgress()))}%
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1E293B] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Disciplinas
                      </div>
                      <div className="text-xl font-bold text-[#FF6B00]">
                        {selectedSubjects.length}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1E293B] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        XP ganho
                      </div>
                      <div className="text-xl font-bold text-[#FF6B00]">
                        +{Math.round((elapsedTime / 60) * 10)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
                  <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-3">
                    <List className="h-4 w-4 text-[#FF6B00]" />
                    Disciplinas estudadas
                  </h4>
                  <div className="space-y-2">
                    {selectedSubjects.map((subjectId) => {
                      const subject = subjects.find((s) => s.id === subjectId);
                      return (
                        <div
                          key={subjectId}
                          className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#F8F9FA] dark:bg-[#29335C] flex items-center justify-center">
                              {subject?.icon}
                            </div>
                            <span className="text-sm font-medium text-[#29335C] dark:text-white">
                              {subject?.name}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-[#FF6B00]">
                            {Math.round(
                              elapsedTime / selectedSubjects.length / 60,
                            )}{" "}
                            min
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
                  <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-[#FF6B00]" />
                    Suas anotações
                  </h4>
                  <div className="bg-white dark:bg-[#1E293B] rounded-lg p-3 border border-gray-200 dark:border-gray-700 min-h-[150px]">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {notes ||
                        "Nenhuma anotação foi feita durante esta sessão."}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#001427] to-[#29335C] text-white rounded-lg p-4 border border-[#FF6B00]/30">
                  <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-[#FF6B00]" />
                    Feedback do Epictus IA
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-200">
                        Excelente sessão de estudo! Você manteve o foco por{" "}
                        {Math.round(elapsedTime / 60)} minutos e cobriu{" "}
                        {selectedSubjects.length} disciplinas diferentes.
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-200">
                        Sugestão: Na próxima sessão, tente aumentar o tempo
                        dedicado à{" "}
                        {subjects.find((s) => s.id === selectedSubjects[0])
                          ?.name || "disciplina principal"}{" "}
                        para melhorar ainda mais seu desempenho.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
                  <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                    Conquistas
                  </h4>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white dark:bg-[#1E293B] rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Estudioso
                        </div>
                        <div className="text-sm font-medium text-[#29335C] dark:text-white">
                          +30 min de estudo
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-[#1E293B] rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Multidisciplinar
                        </div>
                        <div className="text-sm font-medium text-[#29335C] dark:text-white">
                          {selectedSubjects.length} disciplinas
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {sessionState === "completed" && (
            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 px-6"
                onClick={resetSession}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Nova Sessão
              </Button>
              <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-6">
                <Headphones className="h-4 w-4 mr-2" /> Compartilhar Resultados
              </Button>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
            <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-[#FF6B00]" />
              Histórico de sessões
            </h4>
            <div className="space-y-3">
              {[
                {
                  id: 1,
                  date: "Hoje, 10:30",
                  duration: "01:45:00",
                  subjects: ["Matemática", "Física"],
                  progress: 100,
                },
                {
                  id: 2,
                  date: "Ontem, 15:20",
                  duration: "02:15:00",
                  subjects: ["Química", "Biologia"],
                  progress: 90,
                },
                {
                  id: 3,
                  date: "22/07/2023, 09:15",
                  duration: "01:30:00",
                  subjects: ["História", "Matemática"],
                  progress: 100,
                },
                {
                  id: 4,
                  date: "20/07/2023, 14:00",
                  duration: "00:45:00",
                  subjects: ["Física"],
                  progress: 75,
                },
              ].map((session) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-[#1E293B] rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#F8F9FA] dark:bg-[#29335C] flex items-center justify-center">
                        <Clock className="h-4 w-4 text-[#FF6B00]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#29335C] dark:text-white">
                          Sessão de estudo
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {session.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-[#FF6B00]">
                      {session.duration}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {session.subjects.map((subject, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-[#FF6B00]/30 bg-transparent text-[#FF6B00]"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {session.progress}% concluído
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
              <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[#FF6B00]" />
                Tempo Total
              </h4>
              <div className="text-3xl font-bold text-[#FF6B00]">24h 30m</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Nos últimos 30 dias
              </div>
            </div>
            <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
              <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-2">
                <BookOpenCheck className="h-4 w-4 text-[#FF6B00]" />
                Sessões Realizadas
              </h4>
              <div className="text-3xl font-bold text-[#FF6B00]">18</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Nos últimos 30 dias
              </div>
            </div>
            <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
              <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-[#FF6B00]" />
                Eficiência Média
              </h4>
              <div className="text-3xl font-bold text-[#FF6B00]">85%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Metas atingidas
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
              <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                Tempo por disciplina
              </h4>
              <div className="space-y-3">
                {subjects.map((subject, index) => (
                  <div key={subject.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F8F9FA] dark:bg-[#29335C] flex items-center justify-center">
                          {subject.icon}
                        </div>
                        <span className="text-sm text-[#29335C] dark:text-white">
                          {subject.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#FF6B00]">
                        {5 - index}h {(index * 15) % 60}m
                      </span>
                    </div>
                    <Progress
                      value={80 - index * 15}
                      className="h-1.5 bg-[#FF6B00]/10"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
              <h4 className="font-semibold text-[#29335C] dark:text-white flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                Conquistas desbloqueadas
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    title: "Maratonista",
                    description: "10 horas de estudo",
                    icon: <Clock className="h-5 w-5 text-[#FF6B00]" />,
                  },
                  {
                    title: "Multidisciplinar",
                    description: "5 disciplinas estudadas",
                    icon: <BookOpen className="h-5 w-5 text-[#FF6B00]" />,
                  },
                  {
                    title: "Consistente",
                    description: "7 dias seguidos",
                    icon: <BookOpenCheck className="h-5 w-5 text-[#FF6B00]" />,
                  },
                  {
                    title: "Focado",
                    description: "2h sem interrupções",
                    icon: <Target className="h-5 w-5 text-[#FF6B00]" />,
                  },
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#1E293B] rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#29335C] dark:text-white">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1E293B] rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                Adicionar Nova Disciplina
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setShowAddSubjectModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#29335C] dark:text-white">
                  Nome da Disciplina
                </label>
                <Input
                  placeholder="Ex: Geografia"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#29335C] dark:text-white">
                  Ícone
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    "📚",
                    "🌎",
                    "🧪",
                    "🔬",
                    "🧮",
                    "📝",
                    "🎨",
                    "🎭",
                    "🏛️",
                    "📊",
                  ].map((icon) => (
                    <div
                      key={icon}
                      className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${newSubjectIcon === icon ? "bg-[#FF6B00]/20 border-2 border-[#FF6B00]" : "bg-gray-100 dark:bg-gray-800 hover:bg-[#FF6B00]/10"}`}
                      onClick={() => setNewSubjectIcon(icon)}
                    >
                      <span className="text-xl">{icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={addNewSubject}
                  disabled={!newSubjectName.trim()}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1E293B] rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                Adicionar Novo Material
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setShowAddMaterialModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#29335C] dark:text-white">
                  Nome do Material
                </label>
                <Input
                  placeholder="Ex: Apostila de Exercícios"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#29335C] dark:text-white">
                  Tipo
                </label>
                <Select
                  value={newMaterialType}
                  onValueChange={setNewMaterialType}
                >
                  <SelectTrigger className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Livro/Apostila</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="exercise">Exercícios</SelectItem>
                    <SelectItem value="notes">Anotações</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={addNewMaterial}
                  disabled={!newMaterialName.trim()}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowSessionCard;
