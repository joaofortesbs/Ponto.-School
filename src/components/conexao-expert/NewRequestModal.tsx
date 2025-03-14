import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Upload,
  Brain,
  Sparkles,
  AlertCircle,
  DollarSign,
  Clock,
  HelpCircle,
  Lightbulb,
  Image,
  FileText,
  Paperclip,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    level: "ensino_medio",
    isUrgent: false,
    useAuction: true, // Always true as it's required
    initialBid: 20,
    timeLimit: "24",
    attachments: [],
    tags: "",
  });

  const [mentorSuggestion, setMentorSuggestion] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Simulate Mentor IA suggestions
    if (name === "title" && value.length > 10) {
      if (
        value.toLowerCase().includes("equação") ||
        value.toLowerCase().includes("matemática")
      ) {
        setMentorSuggestion(
          "Tente ser mais específico sobre qual tipo de equação você está tendo dificuldade. Isso ajudará os experts a responderem melhor.",
        );
      } else if (value.length > 5 && !mentorSuggestion) {
        setMentorSuggestion(
          "Um bom título é claro e específico. Tente incluir palavras-chave relacionadas à sua dúvida.",
        );
      }
    } else if (name === "description" && value.length > 30) {
      setMentorSuggestion(null);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "O título é obrigatório";
      }
      if (!formData.description.trim()) {
        newErrors.description = "A descrição é obrigatória";
      }
      if (!formData.subject) {
        newErrors.subject = "Selecione uma disciplina";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      onSubmit(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {step === 1 ? "Novo Pedido de Ajuda" : "Configurações Adicionais"}
            </h2>
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

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-base font-medium">
                        Título da Dúvida *
                      </Label>
                      {errors.title && (
                        <span className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.title}
                        </span>
                      )}
                    </div>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Ex: Como resolver equações diferenciais de segunda ordem?"
                      className={`border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 ${errors.title ? "border-red-500" : ""}`}
                    />
                  </div>

                  {mentorSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3 flex items-start gap-2"
                    >
                      <Brain className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <span className="font-medium">Mentor IA:</span>{" "}
                          {mentorSuggestion}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="description"
                        className="text-base font-medium"
                      >
                        Descrição Detalhada *
                      </Label>
                      {errors.description && (
                        <span className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.description}
                        </span>
                      )}
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Descreva sua dúvida em detalhes. Quanto mais informações você fornecer, mais fácil será para os experts ajudarem."
                      className={`min-h-[150px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 ${errors.description ? "border-red-500" : ""}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="subject"
                          className="text-base font-medium"
                        >
                          Disciplina *
                        </Label>
                        {errors.subject && (
                          <span className="text-xs text-red-500 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.subject}
                          </span>
                        )}
                      </div>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) =>
                          handleSelectChange("subject", value)
                        }
                      >
                        <SelectTrigger
                          className={`border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 ${errors.subject ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Selecione a disciplina" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="matematica">Matemática</SelectItem>
                          <SelectItem value="fisica">Física</SelectItem>
                          <SelectItem value="quimica">Química</SelectItem>
                          <SelectItem value="biologia">Biologia</SelectItem>
                          <SelectItem value="historia">História</SelectItem>
                          <SelectItem value="geografia">Geografia</SelectItem>
                          <SelectItem value="literatura">Literatura</SelectItem>
                          <SelectItem value="filosofia">Filosofia</SelectItem>
                          <SelectItem value="sociologia">Sociologia</SelectItem>
                          <SelectItem value="ingles">Inglês</SelectItem>
                          <SelectItem value="programacao">
                            Programação
                          </SelectItem>
                          <SelectItem value="outra">Outra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level" className="text-base font-medium">
                        Nível *
                      </Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) =>
                          handleSelectChange("level", value)
                        }
                      >
                        <SelectTrigger className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30">
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ensino_fundamental">
                            Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="ensino_medio">
                            Ensino Médio
                          </SelectItem>
                          <SelectItem value="graduacao">Graduação</SelectItem>
                          <SelectItem value="pos_graduacao">
                            Pós-Graduação
                          </SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isUrgent"
                        checked={formData.isUrgent}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("isUrgent", !!checked)
                        }
                        className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                      />
                      <Label
                        htmlFor="isUrgent"
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        Marcar como Urgente
                      </Label>
                    </div>

                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                    >
                      Próximo
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-base font-medium">
                      Tags (separadas por vírgula)
                    </Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Ex: cálculo, matemática, equações"
                      className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="useAuction"
                        className="text-base font-medium"
                      >
                        Sistema de Leilão (Obrigatório)
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
                              O sistema de leilão permite que experts façam
                              lances para responder sua dúvida. Você pode
                              escolher o expert com base no valor do lance e na
                              reputação.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-amber-800 dark:text-amber-300">
                            <span className="font-medium">Importante:</span> O
                            sistema de leilão é obrigatório para todos os
                            pedidos. Se você definir um valor de lance baixo,
                            seu pedido poderá ser respondido depois de outros
                            com lances maiores.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useAuction"
                        checked={true}
                        disabled={true}
                        className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                      />
                      <Label
                        htmlFor="useAuction"
                        className="text-sm cursor-pointer"
                      >
                        Sistema de leilão ativado para este pedido
                      </Label>
                    </div>
                  </div>

                  {formData.useAuction && (
                    <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/30">
                      <div className="space-y-2">
                        <Label
                          htmlFor="initialBid"
                          className="text-base font-medium"
                        >
                          Lance Inicial (Ponto Coins)
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input
                            id="initialBid"
                            name="initialBid"
                            type="number"
                            min={5}
                            value={formData.initialBid}
                            onChange={handleInputChange}
                            className="pl-9 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Valor mínimo: 5 Ponto Coins
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="timeLimit"
                          className="text-base font-medium"
                        >
                          Duração do Leilão
                        </Label>
                        <Select
                          value={formData.timeLimit}
                          onValueChange={(value) =>
                            handleSelectChange("timeLimit", value)
                          }
                        >
                          <SelectTrigger className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30">
                            <SelectValue placeholder="Selecione a duração" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6 horas</SelectItem>
                            <SelectItem value="12">12 horas</SelectItem>
                            <SelectItem value="24">24 horas</SelectItem>
                            <SelectItem value="48">2 dias</SelectItem>
                            <SelectItem value="72">3 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="attachments"
                      className="text-base font-medium"
                    >
                      Anexos (opcional)
                    </Label>
                    <div className="border-2 border-dashed border-[#FF6B00]/30 rounded-lg p-6 text-center hover:border-[#FF6B00]/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="attachments"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="attachments"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="h-10 w-10 text-[#FF6B00]/50" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Clique para fazer upload de imagens ou arquivos
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Formatos suportados: JPG, PNG, PDF (máx. 5MB)
                        </span>
                      </label>
                    </div>

                    {formData.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <Label className="text-sm font-medium">
                          Arquivos anexados ({formData.attachments.length})
                        </Label>
                        <div className="space-y-2">
                          {formData.attachments.map((file: any, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                {file.type.includes("image") ? (
                                  <Image className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <FileText className="h-4 w-4 text-orange-500" />
                                )}
                                <span className="text-sm truncate max-w-[200px]">
                                  {file.name}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/20"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                    >
                      Enviar Pedido
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NewRequestModal;
