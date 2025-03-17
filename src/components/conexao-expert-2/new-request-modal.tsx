import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  X,
  HelpCircle,
  Clock,
  AlertTriangle,
  Tag,
  Plus,
  DollarSign,
  Info,
  Upload,
  MessageSquare,
  Eye,
  Sparkles,
  BookOpen,
  GraduationCap,
  FileText
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

const subjects = [
  "Matemática",
  "Física",
  "Química",
  "Biologia",
  "Literatura",
  "História",
  "Geografia",
  "Filosofia",
  "Sociologia",
  "Inglês",
  "Programação",
  "Economia",
  "Contabilidade",
  "Direito",
  "Administração",
  "Outro",
];

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("intermediário");
  const [isUrgent, setIsUrgent] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [initialBid, setInitialBid] = useState(20);
  const [auctionDuration, setAuctionDuration] = useState("24");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic"); // basic, auction, preview
  const [files, setFiles] = useState<File[]>([]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const validateBasicInfo = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "O título é obrigatório";
    if (!description.trim())
      newErrors.description = "A descrição é obrigatória";
    if (!subject) newErrors.subject = "A disciplina é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateBasicInfo()) {
      setActiveTab("auction");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length <= 5) {
        setFiles([...files, ...newFiles]);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      title,
      description,
      subject,
      level,
      urgency: isUrgent,
      tags,
      initialBid,
      auctionDuration,
      status: "em_leilao",
      user: {
        name: "Você",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
      },
      time: "agora",
      responses: 0,
      views: 0,
      files: files.map(f => f.name), // Just send file names for mock
    });

    // Reset form
    setTitle("");
    setDescription("");
    setSubject("");
    setLevel("intermediário");
    setIsUrgent(false);
    setTags([]);
    setInitialBid(20);
    setAuctionDuration("24");
    setErrors({});
    setActiveTab("basic");
    setFiles([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-2xl w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white font-montserrat">Novo Pedido de Ajuda</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
            <TabsList className="w-full h-12 bg-transparent rounded-none">
              <TabsTrigger 
                value="basic" 
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-[#1E293B] rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] h-12"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Informações Básicas
              </TabsTrigger>
              <TabsTrigger 
                value="auction" 
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-[#1E293B] rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] h-12"
                disabled={!validateBasicInfo()}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Sistema de Propostas
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-[#1E293B] rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF6B00] h-12"
                disabled={!validateBasicInfo()}
              >
                <Eye className="h-4 w-4 mr-2" />
                Pré-visualização
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <TabsContent value="basic" className="mt-0 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-base font-medium">
                    Título da Dúvida *
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          type="button"
                        >
                          <HelpCircle className="h-4 w-4 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Seja específico e claro sobre sua dúvida para atrair
                          respostas mais precisas.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) {
                      const { title, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  placeholder="Ex: Como resolver equações diferenciais de segunda ordem?"
                  className={`border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 ${errors.title ? "border-red-500" : ""}`}
                />
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-base font-medium">
                    Descrição Detalhada *
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          type="button"
                        >
                          <HelpCircle className="h-4 w-4 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Explique sua dúvida com detalhes, inclua o que você já
                          tentou e onde está tendo dificuldade.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) {
                      const { description, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  placeholder="Descreva sua dúvida em detalhes. Quanto mais informações você fornecer, mais fácil será para os experts te ajudarem."
                  className={`min-h-[150px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subject" className="text-base font-medium">
                      Disciplina *
                    </Label>
                  </div>
                  <Select
                    value={subject}
                    onValueChange={(value) => {
                      setSubject(value);
                      if (errors.subject) {
                        const { subject, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                  >
                    <SelectTrigger
                      id="subject"
                      className={`border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 ${errors.subject ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Selecione a disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subj) => (
                        <SelectItem key={subj} value={subj}>
                          {subj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-xs text-red-500">{errors.subject}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-base font-medium">
                    Nível de Dificuldade
                  </Label>
                  <Select
                    value={level}
                    onValueChange={setLevel}
                    defaultValue="intermediário"
                  >
                    <SelectTrigger
                      id="level"
                      className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="básico">Ensino Fundamental</SelectItem>
                      <SelectItem value="intermediário">Ensino Médio</SelectItem>
                      <SelectItem value="avançado">Ensino Superior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isUrgent"
                  checked={isUrgent}
                  onCheckedChange={(checked) => setIsUrgent(!!checked)}
                  className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="isUrgent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    Marcar como urgente
                    <AlertTriangle className="h-3.5 w-3.5 ml-1 text-amber-500" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-base font-medium">
                  Tags (opcional)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Adicione tags relevantes"
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddTag}
                    className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments" className="text-base font-medium">
                  Anexos (opcional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                  <Upload className="h-6 w-6 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Arraste arquivos aqui ou
                    <label htmlFor="file-upload" className="text-[#FF6B00] cursor-pointer mx-1">
                      clique para selecionar
                    </label>
                    <input 
                      id="file-upload" 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    />
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Máximo: 5 arquivos, 10MB cada
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/30 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0" 
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                >
                  Próximo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="auction" className="mt-0 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Sistema de Propostas
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                  O sistema de propostas permite que experts ofereçam seus serviços para responder sua dúvida. Você pode definir um valor inicial e escolher a proposta que melhor atenda suas necessidades.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="initialBid" className="text-base font-medium">
                        Valor Inicial (Ponto Coins)
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              type="button"
                            >
                              <HelpCircle className="h-4 w-4 text-gray-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-xs">
                              Este é o valor inicial em Ponto Coins que os experts
                              poderão oferecer para responder sua dúvida. Valores mais
                              altos podem atrair mais experts.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input
                        id="initialBid"
                        type="number"
                        min={5}
                        value={initialBid}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 5) {
                            setInitialBid(value);
                          }
                        }}
                        className="pl-9 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auctionDuration" className="text-base font-medium">
                      Duração das Propostas
                    </Label>
                    <Select
                      value={auctionDuration}
                      onValueChange={setAuctionDuration}
                      defaultValue="24"
                    >
                      <SelectTrigger
                        id="auctionDuration"
                        className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hora</SelectItem>
                        <SelectItem value="6">6 horas</SelectItem>
                        <SelectItem value="12">12 horas</SelectItem>
                        <SelectItem value="24">24 horas</SelectItem>
                        <SelectItem value="48">48 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 flex items-start gap-2">
                <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Seu pedido será publicado e ficará disponível para os experts
                    pelo período selecionado. Você receberá notificações quando houver
                    respostas ou propostas.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                >
                  Pré-visualizar
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0 space-y-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
                  {title || "Título do Pedido"}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {subject && (
                    <Badge variant="outline" className="font-normal">
                      {subject}
                    </Badge>
                  )}
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <DollarSign className="h-3 w-3 mr-1" /> Com Propostas
                  </Badge>
                  {level && (
                    <Badge className={`
                      ${level === "básico" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                      ${level === "intermediário" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" : ""}
                      ${level === "avançado" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : ""}
                    `}>
                      {level}
                    </Badge>
                  )}
                  {isUrgent && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Urgente
                    </Badge>
                  )}
                </div>

                <div className="prose dark:prose-invert max-w-none mb-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {description || "Descrição do pedido..."}
                  </p>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-[#FF6B00]/30 text-[#FF6B00]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-blue-600 dark:text-blue-400">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>Valor Inicial: {initialBid} PC</span>
                    </div>
                    <div className="flex items-center text-blue-600 dark:text-blue-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Duração: {auctionDuration} horas</span>
                    </div>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Anexos:</h4>
                    <div className="flex flex-wrap gap-2">
                      {files.map((file, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>Você</span>
                    <span>•</span>
                    <span>Agora</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>0 respostas</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>0 visualizações</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("auction")}
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                >
                  Publicar Pedido
                </Button