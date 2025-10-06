import React, { useState, useEffect } from "react";
import { Task, TaskStatus, TaskPriority } from "./TasksView";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  BookOpen,
  Presentation,
  FileEdit,
  AlertCircle,
  Users,
  Beaker,
  Lightbulb,
  Paperclip,
  MessageSquare,
  Trash,
  Save,
  Plus,
  X,
  Bell,
  Link,
  Timer,
  Edit,
  Flag,
  Tag,
  User,
  Send,
} from "lucide-react";

interface TaskDetailsModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  open,
  onOpenChange,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [activeTab, setActiveTab] = useState("details");
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Atualizar o estado quando a tarefa mudar
  useEffect(() => {
    setEditedTask({ ...task });
  }, [task]);

  const handleSave = () => {
    onUpdateTask(editedTask);
  };

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      onDeleteTask(task.id);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtasks = editedTask.subtasks || [];
      setEditedTask({
        ...editedTask,
        subtasks: [
          ...subtasks,
          {
            id: `subtask-${Date.now()}`,
            title: newSubtask,
            completed: false,
          },
        ],
      });
      setNewSubtask("");
    }
  };

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    if (editedTask.subtasks) {
      const updatedSubtasks = editedTask.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed } : subtask,
      );

      // Calcular o progresso com base nas subtarefas
      const completedCount = updatedSubtasks.filter(
        (subtask) => subtask.completed,
      ).length;
      const progress = Math.round(
        (completedCount / updatedSubtasks.length) * 100,
      );

      setEditedTask({
        ...editedTask,
        subtasks: updatedSubtasks,
        progress,
      });
    }
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    if (editedTask.subtasks) {
      const updatedSubtasks = editedTask.subtasks.filter(
        (subtask) => subtask.id !== subtaskId,
      );

      // Recalcular o progresso
      const progress =
        updatedSubtasks.length > 0
          ? Math.round(
              (updatedSubtasks.filter((subtask) => subtask.completed).length /
                updatedSubtasks.length) *
                100,
            )
          : 0;

      setEditedTask({
        ...editedTask,
        subtasks: updatedSubtasks,
        progress,
      });
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comments = editedTask.comments || [];
      setEditedTask({
        ...editedTask,
        comments: [
          ...comments,
          {
            id: `comment-${Date.now()}`,
            user: "Você",
            text: newComment,
            timestamp: new Date().toISOString(),
          },
        ],
      });
      setNewComment("");
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const tags = editedTask.tags || [];
      if (!tags.includes(newTag.trim())) {
        setEditedTask({
          ...editedTask,
          tags: [...tags, newTag.trim()],
        });
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (editedTask.tags) {
      setEditedTask({
        ...editedTask,
        tags: editedTask.tags.filter((tag) => tag !== tagToRemove),
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTaskTypeIcon = () => {
    switch (editedTask.type.toLowerCase()) {
      case "exercício":
        return <CheckSquare className="h-5 w-5 text-blue-500" />;
      case "relatório":
        return <FileEdit className="h-5 w-5 text-amber-500" />;
      case "estudo":
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      case "apresentação":
        return <Presentation className="h-5 w-5 text-green-500" />;
      case "leitura":
        return <FileText className="h-5 w-5 text-teal-500" />;
      case "projeto":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case "resumo":
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case "prova":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "laboratório":
        return <Beaker className="h-5 w-5 text-pink-500" />;
      default:
        return <CheckSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "alta":
        return "text-red-500";
      case "média":
        return "text-yellow-500";
      case "baixa":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "a-fazer":
        return "text-blue-500";
      case "em-andamento":
        return "text-purple-500";
      case "concluido":
        return "text-green-500";
      case "atrasado":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTaskTypeIcon()}
              <DialogTitle className="text-xl">
                {isEditing ? (
                  <Input
                    value={editedTask.title}
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, title: e.target.value })
                    }
                    className="text-xl font-bold"
                  />
                ) : (
                  task.title
                )}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="subtasks">Subtarefas</TabsTrigger>
            <TabsTrigger value="comments">Comentários</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>

          {/* Aba de Detalhes */}
          <TabsContent value="details" className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={editedTask.type}
                      onValueChange={(value) =>
                        setEditedTask({ ...editedTask, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exercício">Exercício</SelectItem>
                        <SelectItem value="relatório">Relatório</SelectItem>
                        <SelectItem value="estudo">Estudo</SelectItem>
                        <SelectItem value="apresentação">
                          Apresentação
                        </SelectItem>
                        <SelectItem value="leitura">Leitura</SelectItem>
                        <SelectItem value="projeto">Projeto</SelectItem>
                        <SelectItem value="resumo">Resumo</SelectItem>
                        <SelectItem value="prova">Prova</SelectItem>
                        <SelectItem value="laboratório">Laboratório</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discipline">Disciplina</Label>
                    <Input
                      id="discipline"
                      value={editedTask.discipline}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          discipline: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editedTask.status}
                      onValueChange={(value) =>
                        setEditedTask({
                          ...editedTask,
                          status: value as TaskStatus,
                        })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a-fazer">A Fazer</SelectItem>
                        <SelectItem value="em-andamento">
                          Em Andamento
                        </SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={editedTask.priority}
                      onValueChange={(value) =>
                        setEditedTask({
                          ...editedTask,
                          priority: value as TaskPriority,
                        })
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="média">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Data de Vencimento</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={editedTask.dueDate.slice(0, 16)}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professor">Professor</Label>
                    <Input
                      id="professor"
                      value={editedTask.professor || ""}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          professor: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={editedTask.description || ""}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Anotações</Label>
                  <Textarea
                    id="notes"
                    value={editedTask.notes || ""}
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="Adicione anotações pessoais sobre esta tarefa"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Tags</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nova tag"
                        className="w-40 h-8 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={handleAddTag}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editedTask.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {(!editedTask.tags || editedTask.tags.length === 0) && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Nenhuma tag adicionada
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reminderSet"
                    checked={editedTask.reminderSet || false}
                    onCheckedChange={(checked) =>
                      setEditedTask({
                        ...editedTask,
                        reminderSet: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="reminderSet">Definir lembrete</Label>
                  {editedTask.reminderSet && (
                    <Input
                      type="datetime-local"
                      value={
                        editedTask.reminderTime
                          ? editedTask.reminderTime.slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          reminderTime: e.target.value,
                        })
                      }
                      className="ml-2"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tipo
                    </p>
                    <p className="flex items-center gap-1 font-medium">
                      {getTaskTypeIcon()}
                      {editedTask.type}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Disciplina
                    </p>
                    <p className="flex items-center gap-1 font-medium">
                      <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                      {editedTask.discipline}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <p
                      className={`flex items-center gap-1 font-medium ${getStatusColor(editedTask.status)}`}
                    >
                      <span className="capitalize">
                        {editedTask.status.replace("-", " ")}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Prioridade
                    </p>
                    <p
                      className={`flex items-center gap-1 font-medium ${getPriorityColor(editedTask.priority)}`}
                    >
                      <Flag className="h-4 w-4" />
                      <span className="capitalize">{editedTask.priority}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Data de Vencimento
                    </p>
                    <p className="flex items-center gap-1 font-medium">
                      <Calendar className="h-4 w-4 text-[#FF6B00]" />
                      {formatDate(editedTask.dueDate)}
                    </p>
                  </div>

                  {editedTask.professor && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Professor
                      </p>
                      <p className="flex items-center gap-1 font-medium">
                        <User className="h-4 w-4 text-[#FF6B00]" />
                        {editedTask.professor}
                      </p>
                    </div>
                  )}
                </div>

                {editedTask.description && (
                  <div className="space-y-1 mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Descrição
                    </p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm">{editedTask.description}</p>
                    </div>
                  </div>
                )}

                {editedTask.notes && (
                  <div className="space-y-1 mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Anotações
                    </p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-[#FF6B00]">
                      <p className="text-sm italic">{editedTask.notes}</p>
                    </div>
                  </div>
                )}

                {editedTask.tags && editedTask.tags.length > 0 && (
                  <div className="space-y-1 mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {editedTask.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {editedTask.reminderSet && (
                  <div className="space-y-1 mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lembrete
                    </p>
                    <p className="flex items-center gap-1 text-sm">
                      <Bell className="h-4 w-4 text-[#FF6B00]" />
                      {editedTask.reminderTime
                        ? formatDate(editedTask.reminderTime)
                        : "Lembrete ativado"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Aba de Subtarefas */}
          <TabsContent value="subtasks" className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Adicionar nova subtarefa"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSubtask}
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2 mt-4">
              {editedTask.subtasks && editedTask.subtasks.length > 0 ? (
                editedTask.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`subtask-${subtask.id}`}
                        checked={subtask.completed}
                        onCheckedChange={(checked) =>
                          handleToggleSubtask(subtask.id, checked as boolean)
                        }
                        className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                      />
                      <Label
                        htmlFor={`subtask-${subtask.id}`}
                        className={`text-sm ${subtask.completed ? "line-through text-gray-500" : ""}`}
                      >
                        {subtask.title}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-transparent"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma subtarefa adicionada.
                  </p>
                </div>
              )}
            </div>

            {editedTask.subtasks && editedTask.subtasks.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Progresso
                  </span>
                  <span className="text-sm font-medium">
                    {editedTask.progress}%
                  </span>
                </div>
                <Progress
                  value={editedTask.progress}
                  className="h-2 bg-gray-100 dark:bg-gray-800"
                />
              </div>
            )}
          </TabsContent>

          {/* Aba de Comentários */}
          <TabsContent value="comments" className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Adicionar comentário"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddComment}
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
              >
                <Send className="h-4 w-4 mr-1" /> Enviar
              </Button>
            </div>

            <div className="space-y-4 mt-4">
              {editedTask.comments && editedTask.comments.length > 0 ? (
                editedTask.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">
                        {comment.user}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum comentário adicionado.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Aba de Anexos */}
          <TabsContent value="attachments" className="space-y-4">
            {editedTask.attachments && editedTask.attachments.length > 0 ? (
              <div className="space-y-2">
                {editedTask.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm">{attachment}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      <FileText className="h-4 w-4 mr-1" /> Visualizar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum anexo adicionado.
                </p>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    <Paperclip className="h-4 w-4 mr-1" /> Adicionar Anexo
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  handleSave();
                  setIsEditing(false);
                }}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                <Save className="h-4 w-4 mr-1" /> Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash className="h-4 w-4 mr-1" /> Excluir
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                <Edit className="h-4 w-4 mr-1" /> Editar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;
