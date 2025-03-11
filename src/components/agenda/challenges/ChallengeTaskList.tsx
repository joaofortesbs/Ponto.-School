import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  FileText,
  MessageSquare,
  HelpCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  CheckSquare,
  AlertCircle,
  BookOpen,
  Lightbulb,
  Award,
} from "lucide-react";

export interface Resource {
  type: "video" | "pdf" | "article" | "quiz" | "forum" | "template";
  url: string;
  title: string;
}

export interface ChallengeTask {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  dueDate: string;
  type: "video" | "quiz" | "activity" | "forum" | "reading";
  points: number;
  resources?: Resource[];
}

interface ChallengeTaskListProps {
  tasks: ChallengeTask[];
}

const ChallengeTaskList: React.FC<ChallengeTaskListProps> = ({ tasks }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "quiz":
        return <CheckSquare className="h-5 w-5 text-purple-500" />;
      case "activity":
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case "forum":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "reading":
        return <BookOpen className="h-5 w-5 text-teal-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "pdf":
      case "article":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "quiz":
        return <CheckSquare className="h-4 w-4 text-purple-500" />;
      case "forum":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "template":
        return <FileText className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Concluído
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Em Andamento
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-gray-300 text-gray-600 dark:text-gray-300"
          >
            Pendente
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // Filter by tab
    if (activeTab !== "all" && task.status !== activeTab) {
      return false;
    }

    // Filter by search query
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const completedTasks = tasks.filter((task) => task.status === "completed");
  const completionPercentage = Math.round(
    (completedTasks.length / tasks.length) * 100,
  );

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Progresso das Tarefas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {completedTasks.length} de {tasks.length} tarefas concluídas
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#FF6B00]">
              {completionPercentage}%
            </div>
          </div>
        </div>
        <Progress
          value={completionPercentage}
          className="h-3 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-[#29335C]/10 dark:bg-[#29335C]/30 p-1 rounded-lg w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md"
            >
              Todas ({tasks.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md"
            >
              Concluídas ({completedTasks.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md"
            >
              Pendentes ({tasks.length - completedTasks.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#29335C]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 focus:border-transparent w-full sm:w-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] hover:border-[#FF6B00]/30"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] hover:border-[#FF6B00]/30"
          >
            <SortAsc className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 dark:hover:border-[#FF6B00]/40"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${task.status === "completed" ? "bg-green-100 dark:bg-green-900/20" : task.status === "in-progress" ? "bg-blue-100 dark:bg-blue-900/20" : "bg-gray-100 dark:bg-gray-800"}`}
                    >
                      {getTaskIcon(task.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3
                        className={`text-lg font-bold ${task.status === "completed" ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        <Badge
                          variant="outline"
                          className="border-[#FF6B00]/30 text-[#FF6B00] dark:text-[#FF8C40]"
                        >
                          {task.points} pts
                        </Badge>
                      </div>
                    </div>
                    <p
                      className={`text-sm mb-4 ${task.status === "completed" ? "text-gray-500 dark:text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
                    >
                      {task.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-1 text-[#FF6B00]" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        {task.resources && task.resources.length > 0 && (
                          <div className="flex items-center gap-1">
                            {task.resources
                              .slice(0, 2)
                              .map((resource, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  {getResourceIcon(resource.type)}
                                  {resource.title}
                                </Button>
                              ))}
                            {task.resources.length > 2 && (
                              <Badge
                                variant="outline"
                                className="border-gray-300 text-gray-600 dark:text-gray-300"
                              >
                                +{task.resources.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {task.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-sm border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-medium rounded-lg transition-colors"
                          >
                            <HelpCircle className="h-4 w-4 mr-1" /> Ajuda
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="h-9 text-sm bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          {task.status === "completed" ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />{" "}
                              Concluído
                            </>
                          ) : task.status === "in-progress" ? (
                            <>
                              <ExternalLink className="h-4 w-4 mr-1" />{" "}
                              Continuar
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-1" /> Iniciar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Tente ajustar seus filtros ou termos de busca.
            </p>
            <Button
              variant="outline"
              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors"
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeTaskList;
