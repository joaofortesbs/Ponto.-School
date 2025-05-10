import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  X, Users, Plus, Key, Lock, BookOpen, Palette, Hash, UserPlus, 
  ChevronDown, Check, Search, BookOpen as BookIcon, Tag, Globe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

// Cores de fundo para diferentes tópicos
const topicColors = {
  "matematica": "#FF6B00",
  "portugues": "#4F46E5",
  "fisica": "#8B5CF6",
  "quimica": "#10B981",
  "biologia": "#06B6D4",
  "historia": "#F59E0B",
  "geografia": "#EC4899",
  "filosofia": "#6366F1",
  "sociologia": "#EF4444",
  "ingles": "#0EA5E9",
  "artes": "#EC4899",
  "educacaofisica": "#10B981",
  "literatura": "#F59E0B",
  "informatica": "#0EA5E9",
  "outros": "#6B7280"
};

// Opções de cores para personalização do grupo
const colorOptions = [
  "#FF6B00", // Laranja principal
  "#4F46E5", // Índigo
  "#10B981", // Esmeralda
  "#8B5CF6", // Violeta
  "#EC4899", // Rosa
  "#F59E0B", // Âmbar
  "#06B6D4", // Ciano
  "#EF4444", // Vermelho
  "#6366F1", // Roxo
  "#0EA5E9", // Azul
  "#84CC16", // Verde Limão
  "#14B8A6", // Teal
];

// Lista de tópicos disponíveis
const topics = [
  { id: "matematica", name: "Matemática", icon: "📐" },
  { id: "portugues", name: "Língua Portuguesa", icon: "📝" },
  { id: "fisica", name: "Física", icon: "⚛️" },
  { id: "quimica", name: "Química", icon: "🧪" },
  { id: "biologia", name: "Biologia", icon: "🧬" },
  { id: "historia", name: "História", icon: "📜" },
  { id: "geografia", name: "Geografia", icon: "🌍" },
  { id: "filosofia", name: "Filosofia", icon: "🧠" },
  { id: "sociologia", name: "Sociologia", icon: "👥" },
  { id: "ingles", name: "Inglês", icon: "🇬🇧" },
  { id: "artes", name: "Artes", icon: "🎨" },
  { id: "educacaofisica", name: "Educação Física", icon: "🏃" },
  { id: "literatura", name: "Literatura", icon: "📚" },
  { id: "informatica", name: "Informática", icon: "💻" },
  { id: "outros", name: "Outros", icon: "📌" }
];

// Amigos simulados (em um aplicativo real, isso viria de uma API)
const mockFriends = [
  { id: 1, name: "Ana Silva", username: "anasilva", avatar: null, online: true },
  { id: 2, name: "Carlos Oliveira", username: "carlosoliv", avatar: null, online: false },
  { id: 3, name: "Mariana Costa", username: "maricosta", avatar: null, online: true },
  { id: 4, name: "João Paulo", username: "joaopaulo", avatar: null, online: true },
  { id: 5, name: "Fernanda Lima", username: "ferlima", avatar: null, online: false },
  { id: 6, name: "Rafael Santos", username: "rafsantos", avatar: null, online: true },
  { id: 7, name: "Juliana Mendes", username: "jumendes", avatar: null, online: false },
  { id: 8, name: "Pedro Alves", username: "pedroalv", avatar: null, online: true },
];

const CreateGroupModalEnhanced: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<string>("criar");
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    privado: false,
    cor: "#FF6B00",
    codigo: "",
    topico: "",
    topicoNome: "",
    topicoIcon: "",
    amigos: [] as number[],
    visibilidade: "todos", // "todos" ou "convidados"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<any[]>([]);
  const [friendSearchTerm, setFriendSearchTerm] = useState("");
  const [showTopicSelector, setShowTopicSelector] = useState(false);

  // Filtrar amigos baseado no termo de busca
  const filteredFriends = mockFriends.filter(friend => 
    friend.name.toLowerCase().includes(friendSearchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(friendSearchTerm.toLowerCase())
  );

  // Filtrar tópicos baseado no termo de busca
  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar ou remover amigo da seleção
  const toggleFriendSelection = (friend: any) => {
    if (selectedFriends.some(f => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
      setFormData(prev => ({
        ...prev,
        amigos: prev.amigos.filter(id => id !== friend.id)
      }));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
      setFormData(prev => ({
        ...prev,
        amigos: [...prev.amigos, friend.id]
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, cor: color }));
  };

  const handleTopicSelect = (topic: any) => {
    setFormData(prev => ({ 
      ...prev, 
      topico: topic.id,  // Este valor será usado para filtragem
      topicoNome: topic.name,
      topicoIcon: topic.icon
    }));
    setShowTopicSelector(false);
    setSearchTerm("");
  };

  const handlePrivacyToggle = () => {
    setFormData(prev => ({ ...prev, privado: !prev.privado }));
  };

  const handleVisibilityChange = (value: string) => {
    setFormData(prev => ({ ...prev, visibilidade: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário
    if (!formData.nome.trim()) {
      alert("O nome do grupo é obrigatório");
      return;
    }

    try {
      // Preparar dados para envio
      const dadosGrupo = {
        ...formData,
        amigos: selectedFriends.map(f => f.id),
        amigosDetalhes: selectedFriends,
        topicoNome: formData.topicoNome,
        topicoIcon: formData.topicoIcon
      };

      console.log("Formulário preparado para envio:", dadosGrupo);

      // Enviar para a função de submit passada como prop
      await onSubmit(dadosGrupo);

      // Modal será fechado pelo componente pai após sucesso
    } catch (error) {
      // Tratar erro localmente se ocorrer
      console.error("Erro ao processar formulário:", error);
      // Não fechar o modal em caso de erro para permitir correções
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para entrar em um grupo usando código
    console.log("Entrando com código:", formData.codigo);
    onClose();
  };

  const removeTopic = () => {
    setFormData(prev => ({ 
      ...prev, 
      topico: "",
      topicoNome: "",
      topicoIcon: ""
    }));
  };

  const removeFriend = (friendId: number) => {
    setSelectedFriends(selectedFriends.filter(f => f.id !== friendId));
    setFormData(prev => ({
      ...prev,
      amigos: prev.amigos.filter(id => id !== friendId)
    }));
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: "",
        descricao: "",
        privado: false,
        cor: "#FF6B00",
        codigo: "",
        topico: "",
        topicoNome: "",
        topicoIcon: "",
        amigos: [],
        visibilidade: "todos",
      });
      setSelectedFriends([]);
      setSearchTerm("");
      setFriendSearchTerm("");
      setShowTopicSelector(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden w-[560px] shadow-xl relative"
          >
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Users className="h-6 w-6 mr-3" />
                  Adicionar Novo Grupo de Estudos
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Conecte-se com outros estudantes para compartilhar conhecimento
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <Tabs 
                defaultValue="criar" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="codigo" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <span>Código de acesso</span>
                  </TabsTrigger>
                  <TabsTrigger value="criar" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Criar Grupo</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="codigo" className="mt-0">
                  <form onSubmit={handleCodeSubmit} className="space-y-4 min-h-[400px] flex flex-col">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center mb-6">
                      <div className="bg-orange-100 dark:bg-orange-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-7 w-7 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Entrar em um grupo existente
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mx-auto">
                        Digite o código de acesso fornecido pelo administrador do grupo para participar
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Input
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        placeholder="Digite o código do grupo"
                        className="text-center text-xl tracking-wider font-medium h-14 border-2 border-gray-200 dark:border-gray-700"
                        maxLength={10}
                        autoComplete="off"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        O código é sensível a maiúsculas e minúsculas
                      </p>
                    </div>

                    <div className="flex justify-end mt-auto pt-6 space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        className="h-11"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white h-11"
                      >
                        Entrar no Grupo
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="criar" className="mt-0">
                  <form onSubmit={handleSubmit} className="space-y-4 min-h-[400px] flex flex-col">
                    {/* Seção Básica */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Nome do Grupo <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          placeholder="Ex: Estudo de Cálculo Avançado"
                          required
                          className="w-full border-gray-300 dark:border-gray-600 h-11"
                        />
                      </div>

                      <div>
                        <label htmlFor="descricao" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Descrição
                        </label>
                        <Textarea
                          id="descricao"
                          name="descricao"
                          value={formData.descricao}
                          onChange={handleInputChange}
                          placeholder="Descreva o objetivo do seu grupo de estudos"
                          className="w-full resize-none min-h-[80px] border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <Separator className="my-2" />

                    {/* Seção de Tópico */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center">
                        <BookIcon className="h-4 w-4 mr-2 text-[#FF6B00]" />
                        <span>Tópico do Grupo</span>
                      </label>

                      {formData.topico ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-xl" 
                              style={{ backgroundColor: topicColors[formData.topico as keyof typeof topicColors] || "#6B7280" }}
                            >
                              <span>{formData.topicoIcon}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{formData.topicoNome}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Tópico selecionado</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={removeTopic}
                            className="h-8 w-8 rounded-full p-0 text-gray-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between h-11 border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                            onClick={() => setShowTopicSelector(true)}
                          >
                            <span className="flex items-center">
                              <Tag className="h-4 w-4 mr-2" />
                              Selecionar tópico
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-70" />
                          </Button>

                          {showTopicSelector && (
                            <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Buscar tópicos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 w-full"
                                  />
                                </div>
                              </div>
                              <ScrollArea className="h-56 overflow-auto">
                                <div className="p-1">
                                  {filteredTopics.length > 0 ? (
                                    filteredTopics.map((topic) => (
                                      <div
                                        key={topic.id}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                                        onClick={() => handleTopicSelect(topic)}
                                      >
                                        <div 
                                          className="w-9 h-9 rounded-full flex items-center justify-center text-lg" 
                                          style={{ backgroundColor: topicColors[topic.id as keyof typeof topicColors] || "#6B7280" }}
                                        >
                                          <span>{topic.icon}</span>
                                        </div>
                                        <span className="font-medium">{topic.name}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center p-4 text-gray-500">
                                      Nenhum tópico encontrado
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator className="my-2" />

                    {/* Seção para adicionar amigos */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center">
                        <UserPlus className="h-4 w-4 mr-2 text-[#FF6B00]" />
                        <span>Adicionar Amigos</span>
                      </label>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between h-11 border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                          >
                            <span className="flex items-center">
                              <UserPlus className="h-4 w-4 mr-2" />
                              {selectedFriends.length > 0 
                                ? `${selectedFriends.length} amigo${selectedFriends.length > 1 ? 's' : ''} selecionado${selectedFriends.length > 1 ? 's' : ''}` 
                                : "Selecionar amigos para convidar"}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-70" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Buscar amigos..."
                                value={friendSearchTerm}
                                onChange={(e) => setFriendSearchTerm(e.target.value)}
                                className="pl-9 w-full"
                              />
                            </div>
                          </div>
                          <ScrollArea className="h-56 overflow-auto">
                            <div className="p-1">
                              {filteredFriends.length > 0 ? (
                                filteredFriends.map((friend) => (
                                  <div
                                    key={friend.id}
                                    className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                                    onClick={() => toggleFriendSelection(friend)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                                        <AvatarImage src={friend.avatar || undefined} />
                                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                          {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-sm">{friend.name}</p>
                                        <p className="text-xs text-gray-500">@{friend.username}</p>
                                      </div>
                                    </div>
                                    <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                                      selectedFriends.some(f => f.id === friend.id) 
                                        ? 'bg-[#FF6B00] border-[#FF6B00]' 
                                        : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                      {selectedFriends.some(f => f.id === friend.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center p-4 text-gray-500">
                                  Nenhum amigo encontrado
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>

                      {selectedFriends.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedFriends.map(friend => (
                            <Badge 
                              key={friend.id} 
                              variant="outline"
                              className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px] bg-[#FF6B00]/20 text-[#FF6B00]">
                                  {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{friend.name}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-4 w-4 p-0 ml-1 text-gray-500 hover:text-gray-700"
                                onClick={() => removeFriend(friend.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator className="my-2" />

                    {/* Seção de Configurações Visuais */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center">
                        <Palette className="h-4 w-4 mr-2 text-[#FF6B00]" />
                        <span>Cor do Grupo</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <div
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center ${
                              formData.cor === color 
                                ? 'ring-2 ring-offset-2 ring-gray-700 dark:ring-gray-300 scale-110' 
                                : 'hover:scale-105 hover:shadow-md'
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {formData.cor === color && (
                              <div className="text-white">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-2" />

                    {/* Seção de Privacidade */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-[#FF6B00]" />
                          <span>Visibilidade do Grupo</span>
                        </label>

                        <Select value={formData.visibilidade} onValueChange={handleVisibilityChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a visibilidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Visível para todos</SelectItem>
                            <SelectItem value="convidados">Somente convidados</SelectItem>
                          </SelectContent>
                        </Select>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formData.visibilidade === "todos" 
                            ? "Qualquer pessoa na plataforma poderá ver e solicitar entrada no grupo" 
                            : "Apenas pessoas convidadas ou com o código de acesso poderão entrar no grupo"}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="privado"
                            checked={formData.privado}
                            onChange={handlePrivacyToggle}
                            className="h-4 w-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                          />
                          <label htmlFor="privado" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Grupo privado (somente com código de acesso)
                          </label>
                        </div>
                        {formData.privado && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                            Um código de acesso será gerado automaticamente quando o grupo for criado
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end mt-auto pt-6 space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        className="h-11"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white h-11 px-5"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Grupo
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModalEnhanced;
const handleCreateGroup = async (formData: FormData) => {
    console.log("Formulário enviado:", formData);

    try {
      // Obter a sessão do usuário atual
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Você precisa estar logado para criar um grupo de estudo.");
        return;
      }

      // Preparar dados para criação do grupo
      const novoGrupo = {
        user_id: session.user.id,
        nome: formData.nome,
        descricao: formData.descricao || "",
        cor: formData.cor,
        topico: formData.topico || null,
        topico_nome: formData.topicoNome || null,
        topico_icon: formData.topicoIcon || null,
        privado: formData.privado,
        visibilidade: formData.visibilidade,
        membros: 1, // Inicialmente, apenas o criador é membro
        codigo: formData.codigo || null,
        data_criacao: new Date().toISOString()
      };

      console.log("Enviando dados para criação de grupo:", novoGrupo);

      // Inserir diretamente no banco antes de chamar o callback
      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert(novoGrupo)
        .select('*')
        .single();

      if (error) {
        console.error("Erro ao inserir grupo no banco:", error);
        throw error;
      }

      // Enviar para o callback com os dados retornados
      onSubmit(data);

      // Fechar o modal após submissão bem-sucedida
      onClose();
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      alert(`Erro ao criar grupo: ${error instanceof Error ? error.message : "Tente novamente mais tarde."}`);
    }
  };