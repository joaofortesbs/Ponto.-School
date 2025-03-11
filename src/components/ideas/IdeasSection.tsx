import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Lightbulb,
  Plus,
  Search,
  Settings,
  BookOpen,
  Sparkles,
  Bug,
  Upload,
  X,
  Send,
  ThumbsUp,
  CheckCircle,
  File,
  Image,
  Video,
  Paperclip,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Attachment {
  id: string;
  type: "image" | "document" | "video";
  name: string;
  url: string;
  size: number;
  thumbnailUrl?: string;
  progress?: number;
  status?: "uploading" | "complete" | "error";
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "accepted" | "implemented" | "rejected";
  votes: number;
  createdAt: Date;
  updatedAt: Date;
  userVoted?: boolean;
  section?: string;
  attachments?: Attachment[];
  email?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "new-feature";
  read: boolean;
  timestamp: Date;
  link?: string;
}

const defaultSuggestions: Suggestion[] = [
  {
    id: "1",
    title: "Adicionar modo escuro para a plataforma",
    description:
      "Seria ótimo ter um modo escuro para reduzir o cansaço visual durante estudos noturnos.",
    category: "Interface",
    status: "implemented",
    votes: 156,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    userVoted: true,
  },
  {
    id: "2",
    title: "Integração com Google Calendar",
    description:
      "Permitir sincronização de aulas e prazos com o Google Calendar para melhor organização.",
    category: "Funcionalidade",
    status: "accepted",
    votes: 89,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    userVoted: false,
  },
  {
    id: "3",
    title: "Modo offline para assistir aulas baixadas",
    description:
      "Implementar função para baixar aulas e assistir offline quando não houver conexão com internet.",
    category: "Funcionalidade",
    status: "pending",
    votes: 213,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    userVoted: false,
  },
];

const IdeasSection: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] =
    useState<Suggestion[]>(defaultSuggestions);
  const [isCreatingSuggestion, setIsCreatingSuggestion] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState({
    title: "",
    description: "",
    category: "Nova Funcionalidade",
    anonymous: false,
    section: "",
    email: "",
  });
  const [activeSuggestionTab, setActiveSuggestionTab] = useState("all");
  const [uploadingAttachments, setUploadingAttachments] = useState<
    Attachment[]
  >([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userName, setUserName] = useState("Usuário");

  // Get user data from Supabase
  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (data && data.full_name) {
            setUserName(data.full_name.split(" ")[0]); // Get first name
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to default name if error occurs
        setUserName("Usuário");
      }
    };

    getUserData();
  }, []);

  const handleCreateSuggestion = () => {
    if (
      !newSuggestion.title ||
      !newSuggestion.description ||
      !newSuggestion.category
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validate email if provided
    if (
      newSuggestion.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSuggestion.email)
    ) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, forneça um endereço de e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    const suggestion: Suggestion = {
      id: (suggestions.length + 1).toString(),
      title: newSuggestion.title,
      description: newSuggestion.description,
      category: newSuggestion.category,
      status: "pending",
      votes: 1, // Auto-vote for your own suggestion
      createdAt: new Date(),
      updatedAt: new Date(),
      userVoted: true,
      section: newSuggestion.section,
      attachments: uploadingAttachments.filter((a) => a.status === "complete"),
    };

    setSuggestions((prev) => [suggestion, ...prev]);

    // Show success message
    setShowSuccessMessage(true);

    // Reset form after a delay
    setTimeout(() => {
      setShowSuccessMessage(false);
      setNewSuggestion({
        title: "",
        description: "",
        category: "Nova Funcionalidade",
        anonymous: false,
        section: "",
        email: "",
      });
      setUploadingAttachments([]);
      setIsCreatingSuggestion(false);
    }, 2000);

    // Generate a protocol number
    const protocolNumber = `SUG-${Math.floor(100000 + Math.random() * 900000)}`;

    toast({
      title: "Sugestão enviada",
      description: `Sua sugestão foi enviada com sucesso! Protocolo: ${protocolNumber}`,
    });
  };

  const handleVoteSuggestion = (id: string) => {
    setSuggestions((prev) =>
      prev.map((suggestion) => {
        if (suggestion.id === id) {
          const userVoted = !suggestion.userVoted;
          return {
            ...suggestion,
            votes: userVoted ? suggestion.votes + 1 : suggestion.votes - 1,
            userVoted,
          };
        }
        return suggestion;
      }),
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file
    Array.from(files).forEach((file) => {
      // Create a unique ID for the attachment
      const attachmentId =
        Date.now().toString() + Math.random().toString(36).substring(2, 9);

      // Determine file type
      let fileType: "image" | "document" | "video" = "document";
      if (file.type.startsWith("image/")) fileType = "image";
      if (file.type.startsWith("video/")) fileType = "video";

      // Create attachment object
      const attachment: Attachment = {
        id: attachmentId,
        type: fileType,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        progress: 0,
        status: "uploading",
      };

      // Add to uploading attachments
      setUploadingAttachments((prev) => [...prev, attachment]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          clearInterval(interval);
          progress = 100;

          // Update attachment status to complete
          setUploadingAttachments((prev) =>
            prev.map((a) =>
              a.id === attachmentId
                ? { ...a, progress: 100, status: "complete" }
                : a,
            ),
          );

          // Show toast notification
          toast({
            title: "Upload completo",
            description: `${file.name} foi carregado com sucesso.`,
          });
        } else {
          // Update progress
          setUploadingAttachments((prev) =>
            prev.map((a) =>
              a.id === attachmentId
                ? { ...a, progress: Math.round(progress) }
                : a,
            ),
          );
        }
      }, 300);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelUpload = (id: string) => {
    setUploadingAttachments((prev) => prev.filter((a) => a.id !== id));
    toast({
      title: "Upload cancelado",
      description: "O upload do arquivo foi cancelado.",
    });
  };

  const filteredSuggestions = suggestions
    .filter(
      (suggestion) =>
        suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suggestion.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    )
    .filter((suggestion) => {
      if (activeSuggestionTab === "all") return true;
      if (activeSuggestionTab === "pending")
        return suggestion.status === "pending";
      if (activeSuggestionTab === "accepted")
        return (
          suggestion.status === "accepted" ||
          suggestion.status === "implemented"
        );
      if (activeSuggestionTab === "my") return suggestion.userVoted;
      return true;
    });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gradient-to-r from-[#E0E1DD] to-[#E0E1DD]/80 dark:from-[#001427] dark:to-[#001427]/90">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#FF6B00] dark:text-[#FF6B00]" />
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white font-['Montserrat']">
              Sugestões
            </h3>
          </div>
          <Button
            size="sm"
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-full px-4 py-0 h-9 text-sm transition-all duration-300 hover:scale-105"
            onClick={() => setIsCreatingSuggestion(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Nova Sugestão
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="grid grid-cols-4 w-full bg-[#E0E1DD]/30 dark:bg-[#E0E1DD]/10 rounded-md overflow-hidden">
            <Button
              variant="ghost"
              className={`rounded-none h-9 transition-all duration-200 ${activeSuggestionTab === "all" ? "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90" : "hover:bg-[#E0E1DD]/20 dark:hover:bg-[#E0E1DD]/5"}`}
              onClick={() => setActiveSuggestionTab("all")}
            >
              Todas
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none h-9 transition-all duration-200 ${activeSuggestionTab === "pending" ? "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90" : "hover:bg-[#E0E1DD]/20 dark:hover:bg-[#E0E1DD]/5"}`}
              onClick={() => setActiveSuggestionTab("pending")}
            >
              Pendentes
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none h-9 transition-all duration-200 ${activeSuggestionTab === "accepted" ? "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90" : "hover:bg-[#E0E1DD]/20 dark:hover:bg-[#E0E1DD]/5"}`}
              onClick={() => setActiveSuggestionTab("accepted")}
            >
              Aceitas
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none h-9 transition-all duration-200 ${activeSuggestionTab === "my" ? "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90" : "hover:bg-[#E0E1DD]/20 dark:hover:bg-[#E0E1DD]/5"}`}
              onClick={() => setActiveSuggestionTab("my")}
            >
              Minhas
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sugestões..."
            className="pl-10 py-2 h-10 text-sm rounded-full border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#001427]/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isCreatingSuggestion ? (
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] bg-white dark:bg-[#001427]">
          {showSuccessMessage ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400 animate-success-check" />
              </div>
              <h3 className="text-xl font-semibold text-[#29335C] dark:text-white mb-2 font-['Montserrat']">
                Sugestão Enviada!
              </h3>
              <p className="text-muted-foreground max-w-md">
                Obrigado por contribuir para melhorar a Ponto.School! Sua
                sugestão foi recebida e está em análise.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold flex items-center gap-2 font-['Montserrat'] text-[#29335C] dark:text-white">
                <Lightbulb className="h-6 w-6 text-[#FF6B00]" />
                Compartilhe sua Ideia
              </h3>
              <p className="text-sm text-muted-foreground">
                Ajude-nos a tornar a Ponto.School ainda melhor! Suas sugestões
                são valiosas para nós.
              </p>

              <div className="space-y-5 mt-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Tipo de Sugestão*
                  </label>
                  <div className="relative">
                    <select
                      value={newSuggestion.category}
                      onChange={(e) =>
                        setNewSuggestion({
                          ...newSuggestion,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-md border border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#001427]/50 text-sm appearance-none pl-10"
                    >
                      <option value="Nova Funcionalidade">
                        Nova Funcionalidade
                      </option>
                      <option value="Melhoria em Funcionalidade Existente">
                        Melhoria em Funcionalidade Existente
                      </option>
                      <option value="Correção de Bug/Erro">
                        Correção de Bug/Erro
                      </option>
                      <option value="Ideia de Conteúdo">
                        Ideia de Conteúdo
                      </option>
                      <option value="Outros">Outro</option>
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {newSuggestion.category === "Nova Funcionalidade" && (
                        <Lightbulb className="h-5 w-5 text-[#FF6B00]" />
                      )}
                      {newSuggestion.category ===
                        "Melhoria em Funcionalidade Existente" && (
                        <Settings className="h-5 w-5 text-[#FF6B00]" />
                      )}
                      {newSuggestion.category === "Correção de Bug/Erro" && (
                        <Bug className="h-5 w-5 text-[#FF6B00]" />
                      )}
                      {newSuggestion.category === "Ideia de Conteúdo" && (
                        <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                      )}
                      {newSuggestion.category === "Outros" && (
                        <Sparkles className="h-5 w-5 text-[#FF6B00]" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Título da Sugestão*
                  </label>
                  <Input
                    value={newSuggestion.title}
                    onChange={(e) =>
                      setNewSuggestion({
                        ...newSuggestion,
                        title: e.target.value,
                      })
                    }
                    placeholder="Resumo da sua sugestão..."
                    className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#001427]/50 p-3"
                    maxLength={100}
                  />
                  <div className="text-xs text-right text-muted-foreground mt-1">
                    {newSuggestion.title.length}/100 caracteres
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Descrição da Sugestão*
                  </label>
                  <textarea
                    value={newSuggestion.description}
                    onChange={(e) =>
                      setNewSuggestion({
                        ...newSuggestion,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descreva sua sugestão em detalhes... Seja específico! Inclua exemplos, se possível."
                    className="w-full min-h-[120px] p-3 rounded-md border border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#001427]/50 text-sm"
                    maxLength={1000}
                  />
                  <div className="text-xs text-right text-muted-foreground mt-1">
                    {newSuggestion.description.length}/1000 caracteres
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Seção da Plataforma{" "}
                    <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <select
                    value={newSuggestion.section || ""}
                    onChange={(e) =>
                      setNewSuggestion({
                        ...newSuggestion,
                        section: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-md border border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#001427]/50 text-sm"
                  >
                    <option value="">Selecione uma seção</option>
                    <option value="Dashboard">Dashboard</option>
                    <option value="Cursos">Cursos</option>
                    <option value="Fóruns">Fóruns</option>
                    <option value="Mercado">Mercado de Conhecimento</option>
                    <option value="Perfil">Perfil</option>
                    <option value="Configurações">Configurações</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-[#FF6B00]" />
                    Anexos{" "}
                    <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <div
                    className="border border-dashed border-[#E0E1DD] dark:border-[#E0E1DD]/30 rounded-md p-4 text-center cursor-pointer hover:bg-[#E0E1DD]/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-[#FF6B00]/70" />
                      <p className="text-sm text-muted-foreground">
                        Clique para anexar ou arraste arquivos aqui
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Formatos permitidos: imagens, vídeos, PDF, DOC (máx.
                        5MB)
                      </p>
                    </div>
                  </div>

                  {uploadingAttachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadingAttachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 border rounded-md bg-[#E0E1DD]/10 dark:bg-[#E0E1DD]/5"
                        >
                          {attachment.type === "image" ? (
                            <Image className="h-4 w-4 text-[#FF6B00]" />
                          ) : attachment.type === "video" ? (
                            <Video className="h-4 w-4 text-[#FF6B00]" />
                          ) : (
                            <File className="h-4 w-4 text-[#FF6B00]" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {attachment.name}
                            </p>
                            <Progress
                              value={attachment.progress}
                              className="h-1 mt-1"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-[#E0E1DD]/10"
                            onClick={() => handleCancelUpload(attachment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    E-mail{" "}
                    <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <Input
                    value={newSuggestion.email || ""}
                    onChange={(e) =>
                      setNewSuggestion({
                        ...newSuggestion,
                        email: e.target.value,
                      })
                    }
                    placeholder="Informe seu e-mail se quiser receber um retorno sobre sua sugestão"
                    className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#001427]/50"
                    type="email"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={newSuggestion.anonymous}
                    onChange={(e) =>
                      setNewSuggestion((prev) => ({
                        ...prev,
                        anonymous: e.target.checked,
                      }))
                    }
                    className="rounded border-[#E0E1DD] dark:border-[#E0E1DD]/30"
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-sm text-muted-foreground"
                  >
                    Enviar anonimamente (seu nome não será exibido publicamente)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E1DD] dark:border-[#E0E1DD]/20">
                  <Button
                    variant="outline"
                    className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 text-sm h-10 px-4"
                    onClick={() => setIsCreatingSuggestion(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-sm h-10 px-6 rounded-md transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    onClick={handleCreateSuggestion}
                    disabled={
                      !newSuggestion.title ||
                      !newSuggestion.description ||
                      !newSuggestion.category
                    }
                  >
                    <Send className="h-4 w-4" />
                    Enviar Sugestão
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  * Campos obrigatórios
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <ScrollArea
          className="flex-1 custom-scrollbar"
          style={{ maxHeight: "calc(100% - 60px)" }}
        >
          <div className="p-4 space-y-4">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border border-[#E0E1DD] dark:border-[#E0E1DD]/30 rounded-xl p-4 hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            suggestion.status === "pending"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : suggestion.status === "accepted"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : suggestion.status === "implemented"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                          )}
                        >
                          {suggestion.status === "pending"
                            ? "Pendente"
                            : suggestion.status === "accepted"
                              ? "Aceita"
                              : suggestion.status === "implemented"
                                ? "Implementada"
                                : "Rejeitada"}
                        </div>
                        <div className="bg-[#E0E1DD] text-[#29335C] dark:bg-[#E0E1DD]/20 dark:text-white px-2 py-0.5 text-xs font-medium rounded-full">
                          {suggestion.category}
                        </div>
                        {suggestion.section && (
                          <div className="bg-[#E0E1DD]/50 text-[#29335C] dark:bg-[#E0E1DD]/10 dark:text-white/70 px-2 py-0.5 text-xs font-medium rounded-full">
                            {suggestion.section}
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-[#29335C] dark:text-white mt-2 text-base">
                        {suggestion.title}
                      </h4>
                    </div>
                    <div className="flex flex-col items-center ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-full transition-all duration-200",
                          suggestion.userVoted
                            ? "text-[#FF6B00] hover:text-[#FF6B00]/80 bg-[#FF6B00]/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-[#E0E1DD]/10",
                        )}
                        onClick={() => handleVoteSuggestion(suggestion.id)}
                        disabled={
                          suggestion.status === "implemented" ||
                          suggestion.status === "rejected"
                        }
                      >
                        <ThumbsUp className="h-5 w-5" />
                      </Button>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          suggestion.userVoted
                            ? "text-[#FF6B00]"
                            : "text-muted-foreground",
                        )}
                      >
                        {suggestion.votes}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 mt-1 leading-relaxed">
                    {suggestion.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      Enviada em{" "}
                      {new Date(suggestion.createdAt).toLocaleDateString()}
                    </span>
                    {suggestion.status === "implemented" && (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Implementada em{" "}
                        {new Date(suggestion.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <div className="w-20 h-20 rounded-full bg-[#E0E1DD] dark:bg-[#E0E1DD]/10 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Lightbulb className="h-10 w-10 text-[#FF6B00] dark:text-[#FF6B00]" />
                </div>
                <p className="text-[#29335C] dark:text-white font-medium mb-2 text-lg">
                  Nenhuma sugestão encontrada
                </p>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Seja o primeiro a enviar uma sugestão para melhorar a
                  plataforma! Suas ideias são valiosas para nós.
                </p>
                <Button
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-full px-6 py-2 h-auto transition-all duration-300 hover:scale-105 shadow-md"
                  onClick={() => setIsCreatingSuggestion(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar uma nova sugestão
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes success-check {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-success-check {
          animation: success-check 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default IdeasSection;
