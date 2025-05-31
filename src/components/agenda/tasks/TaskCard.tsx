
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Edit2, Trash2, Calendar, Clock, User, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "./TasksView";

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard = ({ task, onUpdate, onDelete }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    dueDate: task?.dueDate || ''
  });

  // Verificação de segurança para task
  if (!task || !task.id) {
    return null;
  }

  const getPriorityColor = (priority?: string) => {
    const safePriority = priority || 'medium';
    switch (safePriority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status?: string) => {
    const safeStatus = status || 'todo';
    switch (safeStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSave = () => {
    if (!task.id) return;
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      status: task?.status || 'todo',
      dueDate: task?.dueDate || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  if (isEditing) {
    return (
      <Card className="p-4 border border-gray-200 hover:border-orange-300 transition-colors">
        <div className="space-y-3">
          <Input
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Título da tarefa"
            className="font-medium"
          />
          
          <Textarea
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição (opcional)"
            className="min-h-[60px]"
          />

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={editData.priority}
              onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={editData.status}
              onValueChange={(value) => setEditData(prev => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">A Fazer</SelectItem>
                <SelectItem value="in-progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            type="date"
            value={editData.dueDate}
            onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="w-full"
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              <Check className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const taskTitle = task.title || 'Tarefa sem título';
  const taskDescription = task.description || '';
  const taskPriority = task.priority || 'medium';
  const taskStatus = task.status || 'todo';
  const taskDueDate = task.dueDate || '';
  const taskCreatedAt = task.createdAt || '';

  return (
    <Card className="p-4 border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer group">
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
            {taskTitle}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => task.id && onDelete(task.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {taskDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {taskDescription}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={getPriorityColor(taskPriority)}>
            {taskPriority === 'high' ? 'Alta' : 
             taskPriority === 'medium' ? 'Média' : 'Baixa'}
          </Badge>
          <Badge className={getStatusColor(taskStatus)}>
            {taskStatus === 'completed' ? 'Concluído' : 
             taskStatus === 'in-progress' ? 'Em Progresso' : 'A Fazer'}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          {taskDueDate && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(taskDueDate)}
            </div>
          )}
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDate(taskCreatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
