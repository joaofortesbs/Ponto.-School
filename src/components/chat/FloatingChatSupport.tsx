import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import NotebookSimulation from "./NotebookSimulation";
import SlidesPresentationModal from "./SlidesPresentationModal";
import QuizTask from "../agenda/challenges/QuizTask";
import AprofundarModal from "./AprofundarModal";
import {
  MessageSquare,
  Send,
  X,
  Maximize2,
  Paperclip,
  SmilePlus,
  Search,
  Trash,
  Home,
  MessageCircle,
  TicketIcon,
  HelpCircle,
  Clock,
  User,
  Bot,
  FileText,
  Plus,
  Bell,
  Lightbulb,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Vote,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Headphones,
  BookOpen,
  Settings,
  Zap,
  LifeBuoy,
  Rocket,
  Star,
  History,
  RefreshCw,
  Image,
  Video,
  Mic,
  Square,
  Download,
  File,
  Music,
  Loader2,
  Globe,
  Users,
  Copy,
  Check,
  Edit,
  CheckCircle,
  Share2,
  School,
  MonitorPlay
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { generateAIResponse, getConversationHistory, clearConversationHistory } from "@/services/aiChatService";
import { sendEmail } from "@/services/emailService";
import { Checkbox } from "@/components/ui/checkbox";

// Importar componentes separados
import { ChatHomeContent } from "./components/ChatHomeContent";
import { ChatHistoryContent } from "./components/ChatHistoryContent";
import { NotificationsContent } from "./components/NotificationsContent";
import { ChatMessagesList } from "./components/ChatMessagesList";
import { ChatInputArea } from "./components/ChatInputArea";
import { AISettingsModal } from "./components/AISettingsModal";
import { EpictusPersonalizeModal } from "./components/EpictusPersonalizeModal";
import { useFloatingChatSupport } from "./hooks/useFloatingChatSupport";
import { useChatMessages } from "./hooks/useChatMessages";
import { useChatSettings } from "./hooks/useChatSettings";
import { defaultData } from "./data/defaultData";

// Interface para arquivos em mensagens
interface MessageFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

// Interface para mensagens
// Declaração global para a função showQuestionDetails
declare global {
  interface Window {
    showQuestionDetails: (questionType: string, questionNumber: number) => void;
  }
}

interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  files?: MessageFile[];
  feedback?: 'positive' | 'negative';
  needsImprovement?: boolean;
  isEdited?: boolean; // Propriedade para mensagens editadas
  showExportOptions?: boolean; // Controla a visibilidade do popup de exportação principal
  showExportFormats?: boolean; // Controla a visibilidade do popup de formatos de exportação
  showShareOptions?: boolean; // Controla a visibilidade do popup de opções de compartilhamento
  showContextTools?: boolean; // Controla a visibilidade do popup de ferramentas de contexto
  isBeingShared?: boolean; // Indica se a mensagem está em processo de compartilhamento
  shareError?: string; // Armazena erros de compartilhamento
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  category: string;
  createdAt: Date;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: "pending" | "reviewing" | "approved" | "implemented";
  createdAt: Date;
  userVoted: boolean;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: Date;
}

interface CommonQuestion {
  id: string;
  question: string;
  icon: React.ReactNode;
}

interface FormData {
  institution: string;
  grade: string;
  classGroup: string;
  customClassGroup: string;
  customGrade: string;
}

const FloatingChatSupport: React.FC = () => {
  const { toast } = useToast();

  // Estados principais
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Usuário");
  const [sessionId, setSessionId] = useState('');

  // Estados para modais
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  const [showQuizTask, setShowQuizTask] = useState(false);
  const [showAprofundarModal, setShowAprofundarModal] = useState(false);
  const [showEpictusPersonalizeModal, setShowEpictusPersonalizeModal] = useState(false);
  const [isShowingAISettings, setIsShowingAISettings] = useState(false);
  const [showPromptSuggestionModal, setShowPromptSuggestionModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  // Estados para conteúdo
  const [notebookContent, setNotebookContent] = useState("");
  const [presentationSlides, setPresentationSlides] = useState<any[]>([]);
  const [studyContent, setStudyContent] = useState("");
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  // Estados de configurações de IA
  const [aiIntelligenceLevel, setAIIntelligenceLevel] = useState<'basic' | 'normal' | 'advanced'>('normal');
  const [aiLanguageStyle, setAILanguageStyle] = useState<'casual' | 'formal' | 'technical'>('casual');
  const [enableNotificationSounds, setEnableNotificationSounds] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Estados de gerenciamento de mensagens e chat
  const [messages, setMessages] = useState<ChatMessage[]>(defaultData.messages);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [isResponsePaused, setIsResponsePaused] = useState(false);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [promptImprovementLoading, setPromptImprovementLoading] = useState(false);
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [messageToImprove, setMessageToImprove] = useState<number | null>(null);
  const [improvementFeedback, setImprovementFeedback] = useState('');
  const [isReformulating, setIsReformulating] = useState(false);

  // Estados para Tickets, FAQs, Sugestões, Histórico e Notificações
  const [tickets, setTickets] = useState<Ticket[]>(defaultData.tickets);
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultData.faqs);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(defaultData.suggestions);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(defaultData.chatHistory);
  const [notifications, setNotifications] = useState<Notification[]>(defaultData.notifications);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isCreatingSuggestion, setIsCreatingSuggestion] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "Acesso e Conteúdo",
  });
  const [newSuggestion, setNewSuggestion] = useState({
    title: "",
    description: "",
  });

  // Estados para funcionalidades específicas de busca e agente IA
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const [globalSearchEnabled, setGlobalSearchEnabled] = useState(false);
  const [academicSearchEnabled, setAcademicSearchEnabled] = useState(false);
  const [socialSearchEnabled, setSocialSearchEnabled] = useState(false);
  const [agentIAEnabled, setAgentIAEnabled] = useState(false);
  const [agentSettings, setAgentSettings] = useState({
    adjustSettings: false,
    accessPages: false,
    respondMessages: false,
    makeTransfers: false
  });
  const [formData, setFormData] = useState<FormData>({
    institution: "",
    grade: "",
    classGroup: "",
    customClassGroup: "",
    customGrade: ""
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // Efeitos de inicialização
  useEffect(() => {
    const getFirstName = () => {
      if (userName && userName.includes(' ')) {
        return userName.split(' ')[0];
      }
      return userName || 'Usuário';
    };

    const firstName = getFirstName();
    setUserName(firstName);

    const newSessionId = userName || 'anonymous-' + Date.now().toString();
    setSessionId(newSessionId);

    loadUserProfileImage();

    try {
      const savedPersonality = localStorage.getItem('epictus_personality_style');
      if (savedPersonality && (savedPersonality === 'casual' || savedPersonality === 'technical' || savedPersonality === 'formal')) {
        setAILanguageStyle(savedPersonality as 'casual' | 'formal' | 'technical');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de personalidade:', error);
    }

    const loadSavedMessages = async () => {
      try {
        const history = await getConversationHistory(newSessionId);
        if (history && history.length > 1) {
          const convertedMessages: ChatMessage[] = history
            .filter(msg => msg.role !== 'system')
            .slice(-6)
            .map(msg => ({
              id: Date.now() + Math.random().toString(),
              content: msg.content,
              sender: msg.role === 'user' ? 'user' : 'assistant',
              timestamp: new Date(),
            }));
          if (convertedMessages.length > 0) {
            setMessages(prev => [prev[0], ...convertedMessages]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar histórico de mensagens:', error);
      }
    };
    loadSavedMessages();
  }, [userName, setAILanguageStyle, loadUserProfileImage, setSessionId]);

  useEffect(() => {
    if (messagesEndRef.current && !isTyping) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isTyping]);

  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      if (isOpen) {
        mainContent.classList.add("blur-sm", "pointer-events-none");
      } else {
        mainContent.classList.remove("blur-sm", "pointer-events-none");
      }
    }
    return () => {
      if (mainContent) {
        mainContent.classList.remove("blur-sm", "pointer-events-none");
      }
    };
  }, [isOpen]);

  // Funções utilitárias
  const openNotebookModal = (content: string) => {
    setNotebookContent(content);
    setShowNotebookModal(true);
  };

  const openPresentationModal = (slides: any[]) => {
    setPresentationSlides(slides);
    setShowPresentationModal(true);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" && selectedFiles.length === 0) return;
    await sendMessage();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startVoiceRecording = () => {
    // Implementação para iniciar gravação de áudio
    // (Similar à lógica original, precisa ser adaptada para o contexto dos hooks)
  };

  const stopVoiceRecording = () => {
    // Implementação para parar gravação de áudio
    // (Similar à lógica original, precisa ser adaptada para o contexto dos hooks)
  };

  const improvePrompt = async () => {
    if (!inputMessage.trim()) return;
    setPromptImprovementLoading(true);
    setIsImprovingPrompt(true);
    try {
      const improved = await generateAIResponse(
        `Melhore o seguinte prompt para obter uma resposta mais detalhada e completa. NÃO responda a pergunta, apenas melhore o prompt para torná-lo mais específico e detalhado: "${inputMessage}"`,
        `improve_prompt_${Date.now()}`,
        { intelligenceLevel: 'advanced', languageStyle: aiLanguageStyle }
      );
      setImprovedPrompt(improved.replace(/^(Prompt melhorado:|Aqui está uma versão melhorada:|Versão melhorada:)/i, '').replace(/^["']|["']$/g, '').trim());
    } catch (error) {
      console.error('Erro ao melhorar o prompt:', error);
      setImprovedPrompt(inputMessage);
    } finally {
      setPromptImprovementLoading(false);
    }
  };

  const acceptImprovedPrompt = () => {
    setInputMessage(improvedPrompt);
    setIsImprovingPrompt(false);
    setImprovedPrompt("");
  };

  const cancelImprovedPrompt = () => {
    setIsImprovingPrompt(false);
    setImprovedPrompt("");
  };

  const generatePromptSuggestions = async () => {
    if (!studyContent.trim()) return;
    setIsGeneratingPrompts(true);
    setGeneratedPrompts([]);
    try {
      const prompts = await generateAIResponse(
        `Com base no seguinte contexto de estudo, gere 5 prompts de alta qualidade que o usuário poderia fazer para obter informações valiosas. Os prompts devem ser específicos, úteis e variados para cobrir diferentes aspectos do assunto. Retorne apenas os prompts numerados de 1 a 5, sem explicações adicionais.\n\nContexto de estudo: "${studyContent}"\n\nExemplo de formato da resposta:\n1. [Prompt 1]\n2. [Prompt 2]\n3. [Prompt 3]\n4. [Prompt 4]\n5. [Prompt 5]`,
        `prompt_suggestions_${Date.now()}`,
        { intelligenceLevel: 'advanced', languageStyle: 'formal' }
      );
      const promptList = prompts
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(prompt => prompt.length > 0);
      setGeneratedPrompts(promptList);
    } catch (error) {
      console.error('Erro ao gerar sugestões de prompts:', error);
      toast({ title: "Erro ao gerar sugestões", description: "Ocorreu um problema ao gerar as sugestões de prompts. Por favor, tente novamente.", duration: 3000 });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const loadUserProfileImage = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
      const userId = sessionData.session.user.id;
      const { data: profileData } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
      if (profileData?.avatar_url) {
        setProfileImageUrl(profileData.avatar_url);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem de perfil:', error);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!tempProfileImage) return;
    setIsUploadingProfileImage(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({ title: "Erro", description: "Você precisa estar logado para fazer upload de imagens", variant: "destructive" });
        return;
      }
      const userId = sessionData.session.user.id;
      const fileExt = tempProfileImage.name.split('.').pop();
      const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let fileToUpload = tempProfileImage;
      if (tempProfileImage.size > 1000000) { // Comprimir se maior que 1MB
        // Lógica de compressão aqui... (usando canvas ou biblioteca)
      }

      const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(filePath, fileToUpload, { upsert: true });
      if (uploadError) throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (!publicUrlData.publicUrl) throw new Error('Não foi possível obter a URL pública da imagem');

      await supabase.from('profiles').update({ avatar_url: publicUrlData.publicUrl, updated_at: new Date().toISOString() }).eq('id', userId);
      setProfileImageUrl(publicUrlData.publicUrl);
      document.dispatchEvent(new CustomEvent('avatar-updated', { detail: { url: publicUrlData.publicUrl } }));
      toast({ title: "Sucesso", description: "Foto de perfil atualizada com sucesso" });
    } catch (error: any) {
      console.error("Erro ao fazer upload da foto de perfil:", error);
      toast({ title: "Erro", description: `Ocorreu um erro ao fazer upload da foto: ${error.message}`, variant: "destructive" });
    } finally {
      setIsUploadingProfileImage(false);
      setTempProfileImage(null);
    }
  };

  // Filtros para dados
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredChatHistory = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Renderização do conteúdo baseado na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <ChatHomeContent
            userName={userName}
            setActiveTab={setActiveTab}
            setSelectedChat={setSelectedChat}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
          />
        );

      case "chat":
        return selectedChat ? (
          <ChatHistoryContent
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            chatHistory={filteredChatHistory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setActiveTab={setActiveTab}
            renderChatContent={() => (
              <div className="flex flex-col h-full">
                <ChatMessagesList
                  messages={messages}
                  isTyping={isTyping}
                  userName={userName}
                  messagesEndRef={messagesEndRef}
                  sessionId={sessionId}
                  handleMessageFeedback={handleMessageFeedback}
                  reformulateMessage={reformulateMessage}
                  summarizeMessage={summarizeMessage}
                  toast={toast}
                  openNotebookModal={openNotebookModal}
                  openPresentationModal={openPresentationModal}
                  setShowQuizTask={setShowQuizTask}
                  setShowAprofundarModal={setShowAprofundarModal}
                  isResponsePaused={isResponsePaused}
                  setIsResponsePaused={setIsResponsePaused}
                  profileImageUrl={profileImageUrl}
                  setIsImprovingPrompt={setIsImprovingPrompt}
                  setMessageToImprove={setMessageToImprove}
                  setImprovementFeedback={setImprovementFeedback}
                  requestReformulation={requestReformulation}
                  cancelReformulation={cancelReformulation}
                  showAttachmentOptions={showAttachmentOptions}
                  setShowAttachmentOptions={setShowAttachmentOptions}
                  startVoiceRecording={startVoiceRecording}
                  stopVoiceRecording={stopVoiceRecording}
                  isRecordingAudio={isRecordingAudio}
                  audioChunks={audioChunks}
                  audioRecorder={audioRecorder}
                  setAudioRecorder={setAudioRecorder}
                  setAudioChunks={setAudioChunks}
                  improvePrompt={improvePrompt}
                  acceptImprovedPrompt={acceptImprovedPrompt}
                  cancelImprovedPrompt={cancelImprovedPrompt}
                  isImprovingPrompt={isImprovingPrompt}
                  promptImprovementLoading={promptImprovementLoading}
                  improvedPrompt={improvedPrompt}
                  setImprovedPrompt={setImprovedPrompt}
                  generatePromptSuggestions={generatePromptSuggestions}
                  isGeneratingPrompts={isGeneratingPrompts}
                  studyContent={studyContent}
                  setStudyContent={setStudyContent}
                  generatedPrompts={generatedPrompts}
                  setGeneratedPrompts={setGeneratedPrompts}
                  removeFile={removeFile}
                  showPromptSuggestionModal={showPromptSuggestionModal}
                  setShowPromptSuggestionModal={setShowPromptSuggestionModal}
                  showSearchModal={showSearchModal}
                  setShowSearchModal={setShowSearchModal}
                  deepSearchEnabled={deepSearchEnabled}
                  setDeepSearchEnabled={setDeepSearchEnabled}
                  globalSearchEnabled={globalSearchEnabled}
                  setGlobalSearchEnabled={setGlobalSearchEnabled}
                  academicSearchEnabled={academicSearchEnabled}
                  setAcademicSearchEnabled={setAcademicSearchEnabled}
                  socialSearchEnabled={socialSearchEnabled}
                  setSocialSearchEnabled={setSocialSearchEnabled}
                  showAgentModal={showAgentModal}
                  setShowAgentModal={setShowAgentModal}
                  agentIAEnabled={agentIAEnabled}
                  setAgentIAEnabled={setAgentIAEnabled}
                  agentSettings={agentSettings}
                  setAgentSettings={setAgentSettings}
                  formData={formData}
                  setFormData={setFormData}
                />

                <ChatInputArea
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  handleSendMessage={handleSendMessage}
                  fileInputRef={fileInputRef}
                  isLoading={isLoading}
                  aiIntelligenceLevel={aiIntelligenceLevel}
                  aiLanguageStyle={aiLanguageStyle}
                  setIsShowingAISettings={setIsShowingAISettings}
                  isMessageEmpty={inputMessage.trim() === ""}
                  message={inputMessage}
                  sessionId={sessionId}
                  showAttachmentOptions={showAttachmentOptions}
                  setShowAttachmentOptions={setShowAttachmentOptions}
                  startVoiceRecording={startVoiceRecording}
                  stopVoiceRecording={stopVoiceRecording}
                  isRecordingAudio={isRecordingAudio}
                  handleFileUpload={handleFileUpload}
                  removeFile={removeFile}
                  improvePrompt={improvePrompt}
                  acceptImprovedPrompt={acceptImprovedPrompt}
                  cancelImprovedPrompt={cancelImprovedPrompt}
                  isImprovingPrompt={isImprovingPrompt}
                  promptImprovementLoading={promptImprovementLoading}
                  improvedPrompt={improvedPrompt}
                  setImprovedPrompt={setImprovedPrompt}
                  generatePromptSuggestions={generatePromptSuggestions}
                  isGeneratingPrompts={isGeneratingPrompts}
                  studyContent={studyContent}
                  setStudyContent={setStudyContent}
                  generatedPrompts={generatedPrompts}
                  setGeneratedPrompts={setGeneratedPrompts}
                  showPromptSuggestionModal={showPromptSuggestionModal}
                  setShowPromptSuggestionModal={setShowPromptSuggestionModal}
                  showSearchModal={showSearchModal}
                  setShowSearchModal={setShowSearchModal}
                  deepSearchEnabled={deepSearchEnabled}
                  setDeepSearchEnabled={setDeepSearchEnabled}
                  globalSearchEnabled={globalSearchEnabled}
                  setGlobalSearchEnabled={setGlobalSearchEnabled}
                  academicSearchEnabled={academicSearchEnabled}
                  setAcademicSearchEnabled={setAcademicSearchEnabled}
                  socialSearchEnabled={socialSearchEnabled}
                  setSocialSearchEnabled={setSocialSearchEnabled}
                  showAgentModal={showAgentModal}
                  setShowAgentModal={setShowAgentModal}
                  agentIAEnabled={agentIAEnabled}
                  setAgentIAEnabled={setAgentIAEnabled}
                  agentSettings={agentSettings}
                  setAgentSettings={setAgentSettings}
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
            )}
          />
        ) : (
          <ChatHistoryContent
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            chatHistory={filteredChatHistory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setActiveTab={setActiveTab}
            renderChatContent={() => null}
          />
        );

      case "notifications":
        return (
          <NotificationsContent
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Container */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
          isOpen
            ? "w-96 h-[600px] sm:w-[450px] sm:h-[700px]"
            : "w-16 h-16"
        )}
      >
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full h-full rounded-full bg-gradient-to-br from-[#FF8736] to-[#FF6B00] hover:bg-gradient-to-br hover:from-[#FF9856] hover:to-[#FF7B20] shadow-lg shadow-orange-500/20 dark:shadow-orange-700/30 flex items-center justify-center"
          >
            <MessageSquare className="h-6 w-6 text-white" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </Button>
        ) : (
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden flex flex-col h-full animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                  <LifeBuoy className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Suporte Epictus IA
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Assistente inteligente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowEpictusPersonalizeModal(true)}
                >
                  <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
              {[
                { id: "home", icon: Home, label: "Início" },
                { id: "chat", icon: MessageCircle, label: "Chat" },
                { id: "notifications", icon: Bell, label: "Avisos" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500"
                      : "text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {renderContent()}
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <AISettingsModal
        isOpen={isShowingAISettings}
        onClose={() => setIsShowingAISettings(false)}
        aiIntelligenceLevel={aiIntelligenceLevel}
        setAIIntelligenceLevel={setAIIntelligenceLevel}
        aiLanguageStyle={aiLanguageStyle}
        setAILanguageStyle={setAILanguageStyle}
        enableNotificationSounds={enableNotificationSounds}
        setEnableNotificationSounds={setEnableNotificationSounds}
      />

      <EpictusPersonalizeModal
        isOpen={showEpictusPersonalizeModal}
        onClose={() => setShowEpictusPersonalizeModal(false)}
        userName={userName}
        setUserName={setUserName}
        toast={toast}
        profileImageUrl={profileImageUrl}
        setProfileImageUrl={setProfileImageUrl}
        tempProfileImage={tempProfileImage}
        setTempProfileImage={setTempProfileImage}
        isUploadingProfileImage={isUploadingProfileImage}
        setIsUploadingProfileImage={setIsUploadingProfileImage}
        handleProfileImageUpload={handleProfileImageUpload}
        epictusNickname={userName}
        setEpictusNickname={setUserName}
        userOccupation={formData?.institution || ""}
        setUserOccupation={setFormData ? (occ) => setFormData(prev => ({...prev, institution: occ})) : () => {}}
        profileImageInputRef={profileImageInputRef}
      />

      <AprofundarModal
        isOpen={showAprofundarModal}
        onClose={() => setShowAprofundarModal(false)}
      />

      {/* Modal de Caderno */}
      {showNotebookModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotebookModal(false)}></div>
          <div className="relative bg-[#ffffe0] dark:bg-[#252525] w-[95%] max-w-3xl max-h-[70vh] rounded-lg border border-gray-400 dark:border-gray-600 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-amber-100 dark:bg-gray-800 border-b border-gray-400 dark:border-gray-600">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#FF6B00]" />
                Caderno de Anotações
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setShowNotebookModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="h-[50vh] bg-[#fffdf0] dark:bg-[#1e1e18] p-4 notebook-lines">
              <NotebookSimulation content={notebookContent} />
            </ScrollArea>

            <div className="p-3 border-t border-gray-400 dark:border-gray-600 bg-amber-100 dark:bg-gray-800 flex justify-between">
              <Button
                variant="outline"
                className="text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-600 hover:bg-amber-200 dark:hover:bg-gray-700"
                onClick={() => {
                  navigator.clipboard.writeText(notebookContent);
                  toast({
                    title: "Conteúdo copiado!",
                    description: "As anotações foram copiadas para a área de transferência",
                    duration: 3000,
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar texto
              </Button>

              <Button
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                onClick={() => {
                  const blob = new Blob([notebookContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `anotacoes_${new Date().toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);

                  toast({
                    title: "Anotações exportadas",
                    description: "Arquivo de texto baixado com sucesso",
                    duration: 3000,
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar anotações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Apresentação */}
      {showPresentationModal && presentationSlides.length > 0 && (
        <SlidesPresentationModal
          open={showPresentationModal}
          onOpenChange={setShowPresentationModal}
          slides={presentationSlides}
        />
      )}

      {/* Quiz Task */}
      {showQuizTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-auto p-2">
            <QuizTask
              taskId={`quiz-${Date.now()}`}
              title="Quiz de Conhecimentos"
              description="Teste seus conhecimentos sobre o conteúdo discutido"
              questions={[
                {
                  id: "q1",
                  text: "Qual é a principal vantagem de utilizar a Ponto.School para seus estudos?",
                  options: [
                    { id: "q1-a", text: "Apenas materiais didáticos", isCorrect: false },
                    { id: "q1-b", text: "Personalização inteligente com IA", isCorrect: true },
                    { id: "q1-c", text: "Apenas vídeo-aulas", isCorrect: false },
                    { id: "q1-d", text: "Só funciona para ensino fundamental", isCorrect: false }
                  ],
                  explanation: "A Ponto.School oferece personalização inteligente com IA para adaptar o conteúdo às suas necessidades de aprendizado."
                }
              ]}
              timeLimit={45}
              onComplete={(score, total) => {
                setShowQuizTask(false);
                setMessages(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    content: `Você completou o quiz com ${score} de ${total} acertos (${Math.round((score/total)*100)}%).`,
                    sender: "assistant",
                    timestamp: new Date()
                  }
                ]);
              }}
              onClose={() => setShowQuizTask(false)}
            />
          </div>
        </div>
      )}

      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
            e.target.value = '';
          }
        }}
        multiple
        accept="*/*"
        className="hidden"
      />
    </>
  );
};

export default FloatingChatSupport;