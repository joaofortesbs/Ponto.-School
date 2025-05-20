import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Link as LinkIcon,
  MapPin,
  Plus,
  Upload,
  User,
  Users,
  X,
  Globe,
  Bell,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask?: (task: any) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  open,
  onOpenChange,
  onAddTask,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [type, setType] = useState("tarefa");
  const [priority, setPriority] = useState("média");
  const [dueDate, setDueDate] = useState("");
  const [professor, setProfessor] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [subtasks, setSubtasks] = useState<
    { id: string; title: string; completed: boolean }[]
  >([]);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [reminderSet, setReminderSet] = useState(false);
  const [reminderTime, setReminderTime] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [visibility, setVisibility] = useState("private");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [associatedClass, setAssociatedClass] = useState("");
  const [notes, setNotes] = useState("");

  // Sample disciplines
  const disciplines = [
    { id: "matematica", name: "Matemática" },
    { id: "fisica", name: "Física" },
    { id: "quimica", name: "Química" },
    { id: "biologia", name: "Biologia" },
    { id: "historia", name: "História" },
    { id: "geografia", name: "Geografia" },
    { id: "literatura", name: "Literatura" },
    { id: "ingles", name: "Inglês" },
    { id: "filosofia", name: "Filosofia" },
    { id: "computacao", name: "Computação" },
  ];

  // Sample professors
  const professors = [
    { id: "prof1", name: "Prof. Carlos Santos" },
    { id: "prof2", name: "Profa. Maria Silva" },
    { id: "prof3", name: "Prof. João Oliveira" },
    { id: "prof4", name: "Profa. Ana Pereira" },
    { id: "prof5", name: "Prof. Roberto Alves" },
    { id: "prof6", name: "Profa. Mariana Costa" },
    { id: "prof7", name: "Prof. Fernando Mendes" },
    { id: "prof8", name: "Prof. Lucas Oliveira" },
    { id: "prof9", name: "Profa. Beatriz Almeida" },
  ];

  // Sample classes
  const classes = [
    { id: "class1", name: "Matemática Avançada - Turma A" },
    { id: "class2", name: "Física Quântica - Turma B" },
    { id: "class3", name: "Química Orgânica - Turma C" },
    { id: "class4", name: "Biologia Celular - Turma D" },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Validate file size (max 10MB per file)
      const validFiles = newFiles.filter(
        (file) => file.size <= 10 * 1024 * 1024,
      );
      if (validFiles.length !== newFiles.length) {
        alert(
          "Alguns arquivos excedem o tamanho máximo de 10MB e foram ignorados.",
        );
      }
      setAttachments([...attachments, ...validFiles]);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: `subtask-${Date.now()}`,
          title: newSubtask,
          completed: false,
        },
      ]);
      setNewSubtask("");
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((subtask) => subtask.id !== id));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setAttachments(attachments.filter((file) => file !== fileToRemove));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDiscipline("");
    setType("tarefa");
    setPriority("média");
    setDueDate("");
    setProfessor("");
    setSubtasks([]);
    setNewSubtask("");
    setTags([]);
    setNewTag("");
    setReminderSet(false);
    setReminderTime("");
    setAttachments([]);
    setVisibility("private");
    setEstimatedTime("");
    setAssociatedClass("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formState.title) {
        toast({
          title: "Erro ao adicionar tarefa",
          description: "O título da tarefa é obrigatório.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Preparar os dados da tarefa com um ID único e consistente
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const taskData = {
        id: taskId,
        title: formState.title,
        description: formState.description,
        discipline: formState.discipline,
        dueDate: formState.dueDate,
        status: formState.status as TaskStatus,
        priority: formState.priority as TaskPriority,
        progress: 0, // Nova tarefa começa com 0%
        type: "tarefa",
        professor: formState.professor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startTime: formState.startTime,
        endTime: formState.endTime,
      };

      // Log para debugging
      console.log("AddTaskModal: Nova tarefa criada:", taskId);

      // 1. Chamar a função de callback local
      if (onAddTask) {
        console.log("AddTaskModal: Chamando callback onAddTask");
        onAddTask(taskData);
      }

      // 2. Salvar no banco de dados através do serviço
      try {
        console.log("AddTaskModal: Salvando tarefa no banco de dados");
        const user = await getCurrentUser();

        if (user && user.id) {
          // Carregar tarefas atuais para evitar substituição completa
          const currentTasks = await taskService.loadTasks(user.id);

          // Adicionar nova tarefa à lista atual
          const updatedTasks = [...currentTasks, taskData];

          // Salvar lista atualizada
          await taskService.saveTasks(user.id, updatedTasks);
          console.log("AddTaskModal: Tarefa salva com sucesso no banco de dados");
        }
      } catch (error) {
        console.error("AddTaskModal: Erro ao salvar tarefa no banco:", error);
        // Continuamos mesmo com erro para garantir que a tarefa seja adicionada localmente
      }

      // 3. Emitir eventos para todos os sistemas de sincronização
      try {
        console.log("AddTaskModal: Emitindo eventos de sincronização");

        // Emitir evento via serviço principal (método centralizado)
        taskService.emitTaskAdded(taskData);

        // Emitir evento diretamente para componentes específicos (backup)
        const componentsToNotify = [
          '[data-testid="tasks-view"]',
          '[data-testid="pending-tasks-card"]'
        ];

        componentsToNotify.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements && elements.length > 0) {
            elements.forEach(element => {
              console.log(`AddTaskModal: Notificando ${selector} diretamente`);
              element.dispatchEvent(
                new CustomEvent('refresh-tasks', { 
                  detail: {...taskData, _fromDirectEvent: true},
                  bubbles: true 
                })
              );
            });
          }
        });

        // Emitir eventos específicos para cada componente (garantia extra)
        document.dispatchEvent(
          new CustomEvent('pending-tasks-updated', { 
            detail: {...taskData, _fromDirectEvent: true}
          })
        );

        document.dispatchEvent(
          new CustomEvent('tasks-view-updated', { 
            detail: {...taskData, _fromDirectEvent: true}
          })
        );
      } catch (error) {
        console.error("AddTaskModal: Erro ao emitir eventos de atualização:", error);
      }

      // Resetar o formulário
      reset();

      // Fechar o modal se necessário
      if (setOpen) {
        setOpen(false);
      }

      // Mostrar toast de sucesso
      toast({
        title: "Tarefa adicionada",
        description: "Sua tarefa foi adicionada com sucesso e sincronizada com todos os componentes!",
      });
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Ocorreu um erro ao adicionar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da tarefa abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Título */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Título da tarefa"
              required
            />
          </div>

          {/* Descrição */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Descrição detalhada da tarefa"
              rows={3}
            />
          </div>

          {/* Tipo */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="col-span-3">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tarefa">Tarefa</SelectItem>
                <SelectItem value="exercício">Exercício</SelectItem>
                <SelectItem value="relatório">Relatório</SelectItem>
                <SelectItem value="estudo">Estudo</SelectItem>
                <SelectItem value="apresentação">Apresentação</SelectItem>
                <SelectItem value="leitura">Leitura</SelectItem>
                <SelectItem value="projeto">Projeto</SelectItem>
                <SelectItem value="resumo">Resumo</SelectItem>
                <SelectItem value="prova">Prova</SelectItem>
                <SelectItem value="laboratório">Laboratório</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Disciplina */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discipline" className="text-right">
              Disciplina
            </Label>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger id="discipline" className="col-span-3">
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                {disciplines.map((disc) => (
                  <SelectItem key={disc.id} value={disc.id}>
                    {disc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professor */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="professor" className="text-right">
              Professor
            </Label>
            <Select value={professor} onValueChange={setProfessor}>
              <SelectTrigger id="professor" className="col-span-3">
                <SelectValue placeholder="Selecione o professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Nenhum</SelectItem>
                {professors.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Turma Associada */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="associatedClass" className="text-right">
              Turma
            </Label>
            <Select value={associatedClass} onValueChange={setAssociatedClass}>
              <SelectTrigger id="associatedClass" className="col-span-3">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Nenhuma</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prioridade */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Prioridade
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority" className="col-span-3">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="média">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data de Vencimento */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Vencimento
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Subtarefas */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Subtarefas</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Adicionar subtarefa"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubtask}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-2 mt-2">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`subtask-${subtask.id}`}
                          checked={subtask.completed}
                          onCheckedChange={(checked) => {
                            setSubtasks(
                              subtasks.map((st) =>
                                st.id === subtask.id
                                  ? { ...st, completed: checked as boolean }
                                  : st,
                              ),
                            );
                          }}
                        />
                        <Label
                          htmlFor={`subtask-${subtask.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {subtask.title}
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                        onClick={() => handleRemoveSubtask(subtask.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Anexos */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="attachments" className="text-right pt-2">
              Anexos
            </Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" /> Adicionar arquivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
                <span className="text-xs text-gray-500">
                  Máx. 10MB por arquivo
                </span>
              </div>

              {/* Lista de arquivos anexados */}
              {attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                        onClick={() => handleRemoveFile(file)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Anotações */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Anotações
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Anotações pessoais sobre esta tarefa"
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Tags</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Adicionar tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800"
                    >
                      <FileText className="h-3 w-3" />
                      {tag}
                      <button
                        className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lembrete */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Lembrete</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Checkbox
                id="reminderSet"
                checked={reminderSet}
                onCheckedChange={(checked) =>
                  setReminderSet(checked as boolean)
                }
              />
              <Label htmlFor="reminderSet" className="text-sm">
                Definir lembrete
              </Label>
              {reminderSet && (
                <Input
                  type="datetime-local"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="ml-2"
                />
              )}
            </div>
          </div>

          {/* Visibilidade */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="visibility" className="text-right">
              Visibilidade
            </Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger id="visibility" className="col-span-3">
                <SelectValue placeholder="Selecione a visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <span>Privado (somente você)</span>
                  </div>
                </SelectItem>
                <SelectItem value="class">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Turma (visível para sua turma)</span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Público (visível para todos)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tempo Estimado */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="estimatedTime" className="text-right">
              Tempo Estimado
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="estimatedTime"
                type="number"
                min="0"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="Tempo estimado em minutos"
                className="flex-1"
              />
              <span className="text-sm text-gray-500">minutos</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            onClick={handleSubmit}
          >
            Adicionar Tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;