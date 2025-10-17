import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GuiaAvatar from "./GuiaAvatar";
import {
  MessageCircle,
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Diamond,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Trash2,
  BellOff,
  Clock,
  Calendar,
  Award,
  Zap,
  AlertCircle,
  X,
  BellRing,
  Brain,
  Reply,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";
import PerfilCabecalho from "@/components/layout/perfil-cabeçalho/PerfilCabecalho";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import MessageReplyModal from "@/components/layout/MessageReplyModal";
import LoginDiario from "@/components/logindiario/LoginDiario";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [typingEffect, setTypingEffect] = useState({
    isTyping: false,
    text: "",
    fullText: "",
    isDeleting: false,
    typingSpeed: 100,
    deletingSpeed: 50,
    pauseDuration: 1500,
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSilenceDialogOpen, setIsSilenceDialogOpen] = useState(false);
  const [silenceDuration, setSilenceDuration] = useState("1h");
  const [notificationsSilenced, setNotificationsSilenced] = useState(false);
  const [messagesSilenced, setMessagesSilenced] = useState(false);
  const [silenceEndTime, setSilenceEndTime] = useState<Date | null>(null);
  const [swipingItemId, setSwipingItemId] = useState<string | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeCurrentX, setSwipeCurrentX] = useState<number | null>(null);
  const [deletedNotifications, setDeletedNotifications] = useState<string[]>(
    [],
  );
  const [deletedMessages, setDeletedMessages] = useState<string[]>([]);
  const [silenceType, setSilenceType] = useState<
    "all" | "messages" | "notifications"
  >("all");
  const [lastAutoNotificationTime, setLastAutoNotificationTime] =
    useState<Date | null>(null);
  const [currentNotificationType, setCurrentNotificationType] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedMessageForReply, setSelectedMessageForReply] =
    useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingAiSuggestions, setIsGeneratingAiSuggestions] =
    useState(false);
  const [isDark, setIsDark] = useState(false); // Added isDark state
  const [theme, setTheme] = useState("light"); // Added theme state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search suggestions
  const searchSuggestions = [
    "Como usar a IA da plataforma?",
    "Como adicionar amigos?",
    "Como ganhar Sparks?",
    "Como posso começar os meus estudos de hoje?",
  ];

  // All sets of AI suggestions to cycle through
  const allAiSuggestionSets = [
    // 1° Geração de sugestões
    [
      "Como melhorar meu desempenho em matemática?",
      "Quais são os próximos eventos da plataforma?",
      "Como criar um grupo de estudos personalizado?",
    ],
    // 2° Geração de sugestões
    [
      "Quais são as novidades da semana?",
      "Como eu posso usar o Epictus IA para melhorar meu estudos?",
      "Como eu posso acessar as Minhas Turmas?",
    ],
    // 3° Geração de sugestões
    [
      "Quais são as premiações do mês?",
      "Como eu posso organizar a minha rotina?",
      "Como eu posso personalizar o meu perfil dentro da Ponto. School?",
    ],
    // 4° Geração de sugestões
    [
      "Como fazer recargas dentro da Ponto. School?",
      "Como eu posso trocar as minhas Sparks?",
      "Como eu posso participar da Trilha School?",
    ],
    // 5° Geração de sugestões
    [
      "Como eu posso crescer o meu engajamento com a Ponto. School?",
      "Qual é o livro do mês do clube do livro?",
      "Como participar da Jornada de Conhecimento?",
    ],
    // 6° Geração de sugestões
    [
      "Como eu posso ganhar SKs com a Conexão Expert?",
      "Como eu posso participar de um clube do Livro com a Ponto. School?",
      "Como eu posso ver o meu desempenho nas notas escolares?",
    ],
    // 7° Geração de sugestões
    [
      "Como eu posso trocar itens dentro da Ponto. School?",
      "Como eu posso organizar o meu trabalho em grupo?",
      "Como eu posso criar os meus próprios eventos?",
    ],
  ];

  // Current suggestion set index
  const [currentSuggestionSetIndex, setCurrentSuggestionSetIndex] = useState(0);

  // Function to generate new AI suggestions
  const generateAiSuggestions = () => {
    setIsGeneratingAiSuggestions(true);

    // Force search dropdown to stay open
    setIsSearchFocused(true);

    // Prevent search dropdown from closing during suggestion generation
    const keepFocused = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Force search to stay focused
      setIsSearchFocused(true);
    };

    // Add event listeners to keep dropdown open
    document.addEventListener("click", keepFocused, { capture: true });
    document.addEventListener("mousedown", keepFocused, { capture: true });
    document.addEventListener("mouseup", keepFocused, { capture: true });

    // Simulate AI generating suggestions
    setTimeout(() => {
      // Get the next set of suggestions
      const nextIndex =
        (currentSuggestionSetIndex + 1) % allAiSuggestionSets.length;
      const newSuggestions = allAiSuggestionSets[nextIndex];

      setAiSuggestions(newSuggestions);
      setCurrentSuggestionSetIndex(nextIndex);
      setIsGeneratingAiSuggestions(false);

      // Keep the dropdown open for a moment after suggestions are generated
      setTimeout(() => {
        // Remove event listeners
        document.removeEventListener("click", keepFocused, { capture: true });
        document.removeEventListener("mousedown", keepFocused, {
          capture: true,
        });
        document.removeEventListener("mouseup", keepFocused, { capture: true });
      }, 300);
    }, 1500);
  };

  // Type animation effect for search suggestions
  useEffect(() => {
    if (!isSearchFocused) {
      setTypingEffect((prev) => ({
        ...prev,
        isTyping: false,
        text: "",
        isDeleting: false,
      }));
      return;
    }

    const suggestion = searchSuggestions[currentSuggestionIndex];
    let timerId: NodeJS.Timeout;

    const typeChar = () => {
      setTypingEffect((prev) => {
        // If we're not currently typing or deleting, start with a new suggestion
        if (!prev.isTyping && !prev.isDeleting) {
          return {
            ...prev,
            isTyping: true,
            isDeleting: false,
            text: suggestion.charAt(0),
            fullText: suggestion,
          };
        }

        // If we're typing and haven't finished the word
        if (prev.isTyping && prev.text.length < prev.fullText.length) {
          const nextChar = prev.fullText.charAt(prev.text.length);
          const newText = prev.text + nextChar;

          return {
            ...prev,
            text: newText,
          };
        }

        // If we've finished typing the word, pause then start deleting
        if (prev.isTyping && prev.text.length === prev.fullText.length) {
          timerId = setTimeout(() => {
            setTypingEffect((p) => ({
              ...p,
              isTyping: false,
              isDeleting: true,
            }));
            typeChar();
          }, prev.pauseDuration);

          return prev;
        }

        // If we're deleting and there's still text left
        if (prev.isDeleting && prev.text.length > 0) {
          const newText = prev.text.substring(0, prev.text.length - 1);

          return {
            ...prev,
            text: newText,
          };
        }

        // If we've finished deleting, move to the next suggestion
        if (prev.isDeleting && prev.text.length === 0) {
          // Move to next suggestion immediately
          const nextIndex =
            (currentSuggestionIndex + 1) % searchSuggestions.length;
          setCurrentSuggestionIndex(nextIndex);

          return {
            ...prev,
            isTyping: true,
            isDeleting: false,
            text: searchSuggestions[nextIndex].charAt(0),
            fullText: searchSuggestions[nextIndex],
          };
        }

        return prev;
      });
    };

    // Start or continue the typing effect
    const { isTyping, isDeleting, typingSpeed, deletingSpeed } = typingEffect;
    const speed = isDeleting ? deletingSpeed : typingSpeed;

    timerId = setTimeout(typeChar, speed);

    return () => {
      clearTimeout(timerId);
    };
  }, [
    isSearchFocused,
    currentSuggestionIndex,
    searchSuggestions,
    typingEffect,
  ]);

  // Notification types for auto-generated notifications
  const notificationTypes = [
    {
      type: "feature",
      icon: <Zap className="h-4 w-4" />,
      titles: [
        "Nova funcionalidade disponível",
        "Atualização da plataforma",
        "Novidade na Ponto.School",
      ],
      descriptions: [
        "Experimente o novo sistema de recomendações personalizadas!",
        "Agora você pode personalizar seu dashboard com seus widgets favoritos.",
        "Nova interface de estudos com foco em produtividade.",
        "Modo escuro aprimorado para reduzir o cansaço visual.",
        "Sistema de conquistas renovado com mais recompensas!",
      ],
    },
    {
      type: "event",
      icon: <Calendar className="h-4 w-4" />,
      titles: [
        "Evento próximo",
        "Não perca este evento",
        "Programação Ponto.School",
      ],
      descriptions: [
        "Webinar sobre técnicas de estudo avançadas nesta sexta-feira.",
        "Workshop de preparação para o ENEM no próximo sábado.",
        "Maratona de programação com premiações exclusivas!",
        "Palestra com especialistas em educação e tecnologia.",
        "Encontro virtual da comunidade Ponto.School neste domingo.",
      ],
    },
    {
      type: "award",
      icon: <Award className="h-4 w-4" />,
      titles: [
        "Premiações disponíveis",
        "Conquiste recompensas",
        "Novos prêmios desbloqueados",
      ],
      descriptions: [
        "Complete desafios diários e ganhe pontos para trocar por prêmios exclusivos.",
        "Novo sistema de ranking com recompensas mensais para os melhores alunos.",
        "Participe dos desafios semanais e concorra a cursos gratuitos.",
        "Programa de indicação renovado: traga amigos e ganhe benefícios premium.",
        "Medalhas exclusivas para quem mantém sequência de estudos por 30 dias.",
      ],
    },
    {
      type: "appointment",
      icon: <AlertCircle className="h-4 w-4" />,
      titles: [
        "Compromisso próximo",
        "Não esqueça sua agenda",
        "Lembrete importante",
      ],
      descriptions: [
        "Você tem uma aula agendada para amanhã às 15h.",
        "Prazo para entrega de atividade expira em 2 dias.",
        "Reunião de grupo de estudos marcada para hoje às 19h.",
        "Não esqueça da prova simulada neste final de semana.",
        "Horário reservado para revisão de conteúdo hoje às 20h.",
      ],
    },
  ];

  // Mock notifications data
  const notifications = [
    {
      id: "1",
      title: "Nova atualização disponível",
      description: "Confira as novas funcionalidades da plataforma!",
      type: "update",
      date: "Hoje, 10:30",
      read: false,
    },
    {
      id: "2",
      title: "Aviso importante",
      description: "Manutenção programada para o próximo domingo.",
      type: "warning",
      date: "Ontem, 15:45",
      read: true,
    },
    {
      id: "3",
      title: "Novos cursos adicionados",
      description:
        "Confira os novos cursos de Física Quântica e Matemática Avançada.",
      type: "info",
      date: "2 dias atrás",
      read: true,
    },
  ];

  // Mock messages data
  const messages = [
    {
      id: "1",
      sender: "Suporte Técnico",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Support",
      message: "Olá! Como posso ajudar você hoje?",
      time: "10:30",
      date: "Hoje",
      unread: true,
      responseCount: 0,
    },
    {
      id: "2",
      sender: "Prof. Carlos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      message: "Lembre-se de enviar o trabalho até sexta-feira!",
      time: "15:45",
      date: "Ontem",
      unread: false,
      responseCount: 2,
    },
    {
      id: "3",
      sender: "Grupo de Estudos - Física",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Physics",
      message: "Maria: Alguém pode me ajudar com o exercício 5?",
      time: "09:15",
      date: "2 dias atrás",
      unread: false,
      responseCount: 1,
    },
  ];

  // State for notifications and messages
  const [notificationsData, setNotificationsData] = useState(notifications);
  const [messagesData, setMessagesData] = useState(messages);

  // Silence timer effect
  useEffect(() => {
    let silenceTimer: NodeJS.Timeout;

    if (silenceEndTime) {
      const timeUntilEnd = silenceEndTime.getTime() - Date.now();

      if (timeUntilEnd > 0) {
        silenceTimer = setTimeout(() => {
          if (silenceType === "all" || silenceType === "notifications") {
            setNotificationsSilenced(false);
          }
          if (silenceType === "all" || silenceType === "messages") {
            setMessagesSilenced(false);
          }
          setSilenceEndTime(null);
        }, timeUntilEnd);
      } else {
        if (silenceType === "all" || silenceType === "notifications") {
          setNotificationsSilenced(false);
        }
        if (silenceType === "all" || silenceType === "messages") {
          setMessagesSilenced(false);
        }
        setSilenceEndTime(null);
      }
    }

    return () => clearTimeout(silenceTimer);
  }, [silenceEndTime, silenceType]);

  // Function to generate a new auto notification
  const generateAutoNotification = () => {
    if (notificationsSilenced) return; // Don't generate if notifications are silenced

    const typeIndex = currentNotificationType % notificationTypes.length;
    const notificationType = notificationTypes[typeIndex];

    // Get random title and description from the current notification type
    const titleIndex = Math.floor(
      Math.random() * notificationType.titles.length,
    );
    const descIndex = Math.floor(
      Math.random() * notificationType.descriptions.length,
    );

    const title = notificationType.titles[titleIndex];
    const description = notificationType.descriptions[descIndex];

    // Create a new notification object
    const newNotification = {
      id: `auto-${Date.now()}`,
      title,
      description,
      type:
        notificationType.type === "feature"
          ? "update"
          : notificationType.type === "event"
            ? "info"
            : notificationType.type === "award"
              ? "info"
              : "warning",
      date: "Agora mesmo",
      read: false,
    };

    // Add the new notification to the notifications array
    setNotificationsData((prev) => [newNotification, ...prev]);

    // Play notification sound if audio ref is available
    if (audioRef.current) {
      try {
        // Tentar reproduzir o som com tratamento de erros melhorado
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silenciar erros de reprodução de áudio (geralmente por interação do usuário)
            console.log("Notificação silenciosa (interação do usuário necessária)");
          });
        }
      } catch (err) {
        // Falha silenciosa para evitar erros no console
      }
    }

    // Update the last notification time and type
    setLastAutoNotificationTime(new Date());
    setCurrentNotificationType((prev) => prev + 1);
  };

  // Effect for auto-generating notifications every 15 minutes
  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio("/message-sound.mp3");
    audioRef.current.volume = 0.5;

    // Set initial session start time
    setSessionStartTime(new Date());

    // Check every minute if it's time to generate a new notification
    const intervalId = setInterval(() => {
      const now = new Date();
      const timeSinceLastNotification = lastAutoNotificationTime
        ? now.getTime() - lastAutoNotificationTime.getTime()
        : now.getTime() - sessionStartTime.getTime();

      // If it's been 15 minutes (900000 ms) since the last notification, generate a new one
      if (timeSinceLastNotification >= 900000) {
        // 15 minutes in milliseconds
        generateAutoNotification();
      }
    }, 60000); // Check every minute

    // Generate first notification after 1 minute of session start
    const initialTimeoutId = setTimeout(() => {
      generateAutoNotification();
    }, 60000); // 1 minute in milliseconds

    return () => {
      clearInterval(intervalId);
      clearTimeout(initialTimeoutId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [
    lastAutoNotificationTime,
    currentNotificationType,
    notificationsSilenced,
  ]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await profileService.getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();

    // Obter a imagem padrão da configuração global ou usar o valor padrão
    const defaultLogo =
      window.PONTO_SCHOOL_CONFIG?.defaultLogo ||
      "/images/ponto-school-logo.png";

    // Definir logo imediatamente para evitar atraso na renderização
    setCustomLogo(defaultLogo);

    // Função para carregar e configurar a logo
    const loadAndConfigureLogo = (logoUrl = null) => {
      try {
        // Se recebemos uma URL específica do evento, usá-la
        if (logoUrl) {
          setCustomLogo(logoUrl);
          setIsLoading(false);
          return;
        }

        // Verificar primeiro a logo específica da Ponto School
        const pontoSchoolLogo = localStorage.getItem("pontoSchoolLogo");
        if (
          pontoSchoolLogo &&
          pontoSchoolLogo !== "null" &&
          pontoSchoolLogo !== "undefined"
        ) {
          setCustomLogo(pontoSchoolLogo);
          setIsLoading(false);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
            window.PONTO_SCHOOL_CONFIG.defaultLogo = pontoSchoolLogo;
          }
          return;
        }

        // Verificar se já existe uma logo personalizada no localStorage
        const savedLogo = localStorage.getItem("customLogo");
        if (savedLogo && savedLogo !== "null" && savedLogo !== "undefined") {
          setCustomLogo(savedLogo);
          setIsLoading(false);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
          }
        } else {
          // Se não existir, usar a logo padrão e salvar no localStorage
          setCustomLogo(defaultLogo);
          localStorage.setItem("customLogo", defaultLogo);
          localStorage.setItem("pontoSchoolLogo", defaultLogo);
          localStorage.setItem("logoPreloaded", "true");
          setIsLoading(false);
        }
      } catch (e) {
        console.warn("Erro ao acessar localStorage no Header", e);
        // Usar a logo padrão mesmo se não conseguir acessar o localStorage
        setCustomLogo(defaultLogo);
        setIsLoading(false);
      }
    };

    // Pré-carregar a imagem com alta prioridade para garantir que esteja disponível
    const preloadImg = new Image();
    preloadImg.src = defaultLogo;
    preloadImg.fetchPriority = "high";
    preloadImg.crossOrigin = "anonymous";

    preloadImg.onload = () => {
      // Garantir que a imagem está carregada antes de usar
      console.log("Logo carregada com sucesso no Header");
      loadAndConfigureLogo();
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: defaultLogo }),
      );
    };

    // Garantir que a imagem seja carregada mesmo se houver erro
    preloadImg.onerror = () => {
      console.error("Erro ao carregar logo no Header, tentando novamente...");

      // Tentar novamente com um timestamp para evitar cache
      setTimeout(() => {
        const retryImg = new Image();
        retryImg.src = defaultLogo + "?retry=" + Date.now();
        retryImg.fetchPriority = "high";

        retryImg.onload = () => {
          console.log("Logo carregada com sucesso após retry no Header");
          setCustomLogo(retryImg.src);
          localStorage.setItem("customLogo", retryImg.src);
          localStorage.setItem("pontoSchoolLogo", retryImg.src);
          localStorage.setItem("logoPreloaded", "true");
          setIsLoading(false);
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: retryImg.src }),
          );
        };

        retryImg.onerror = () => {
          console.error("Falha definitiva ao carregar logo no Header");
          // Usar texto como fallback (null indica para usar o texto)
          setCustomLogo(null);
          setIsLoading(false);
          document.dispatchEvent(new CustomEvent("logoLoadFailed"));
        };
      }, 1000);
    };

    // Verificar se a logo já foi carregada por outro componente
    if (window.PONTO_SCHOOL_CONFIG?.logoLoaded) {
      loadAndConfigureLogo(window.PONTO_SCHOOL_CONFIG.defaultLogo);
    }

    // Adicionar listeners para eventos de carregamento da logo
    const handleLogoLoaded = (event) => {
      console.log("Logo loaded event received in Header", event.detail);
      loadAndConfigureLogo(event.detail);
    };

    const handleLogoLoadFailed = () => {
      console.log("Logo load failed event received in Header");
      setCustomLogo(null);
      setIsLoading(false);
    };

    document.addEventListener("logoLoaded", handleLogoLoaded);
    document.addEventListener("logoLoadFailed", handleLogoLoadFailed);

    return () => {
      document.removeEventListener("logoLoaded", handleLogoLoaded);
      document.removeEventListener("logoLoadFailed", handleLogoLoadFailed);
    };
  }, []);

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;

        try {
          // Get current version from Supabase
          const { data, error } = await supabase
            .from("platform_settings")
            .select("logo_version")
            .single();

          // Increment version
          const newVersion = (data?.logo_version || 1) + 1;

          // Update logo in Supabase with new version
          await supabase.from("platform_settings").upsert(
            {
              id: 1,
              logo_url: result,
              logo_version: newVersion,
            },
            { onConflict: "id" },
          );

          // Import dynamically to avoid circular dependencies
          const { getVersionedLogoUrl, saveLogoToLocalStorage } = await import(
            "@/lib/logo-utils"
          );

          // Save to localStorage with new version
          saveLogoToLocalStorage(result, newVersion);

          // Update UI
          const versionedUrl = getVersionedLogoUrl(result, newVersion);
          setCustomLogo(versionedUrl);

          // Notify other components
          document.dispatchEvent(
            new CustomEvent("logoLoaded", { detail: versionedUrl }),
          );

          setIsLogoDialogOpen(false);
        } catch (error) {
          console.error("Error updating logo:", error);
          // Still update locally even if Supabase update fails
          setCustomLogo(result);
          localStorage.setItem("customLogo", result);
          setIsLogoDialogOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetLogo = async () => {
    try {
      // Import dynamically to avoid circular dependencies
      const { DEFAULT_LOGO } = await import("@/lib/logo-utils");

      // Get current version from Supabase
      const { data, error } = await supabase
        .from("platform_settings")
        .select("logo_version")
        .single();

      // Increment version
      const newVersion = (data?.logo_version || 1) + 1;

      // Update logo in Supabase with default logo and new version
      await supabase.from("platform_settings").upsert(
        {
          id: 1,
          logo_url: DEFAULT_LOGO,
          logo_version: newVersion,
        },
        { onConflict: "id" },
      );

      // Clear localStorage
      localStorage.removeItem("customLogo");
      localStorage.removeItem("pontoSchoolLogo");
      localStorage.removeItem("sidebarCustomLogo");
      localStorage.setItem("logoVersion", newVersion.toString());

      // Update UI
      setCustomLogo(null);

      // Notify other components
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: DEFAULT_LOGO }),
      );

      setIsLogoDialogOpen(false);
    } catch (error) {
      console.error("Error resetting logo:", error);
      // Still reset locally even if Supabase update fails
      setCustomLogo(null);
      localStorage.removeItem("customLogo");
      setIsLogoDialogOpen(false);
    }
  };

  // Swipe gesture handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent, id: string) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      setSwipingItemId(id);
      setSwipeStartX(clientX);
      setSwipeCurrentX(clientX);
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (swipeStartX === null) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      setSwipeCurrentX(clientX);
    },
    [swipeStartX],
  );

  const handleTouchEnd = useCallback(() => {
    if (swipeStartX === null || swipeCurrentX === null) return;

    const swipeDistance = swipeStartX - swipeCurrentX;

    // Reset swipe state
    setSwipeStartX(null);
    setSwipeCurrentX(null);

    // If swipe distance is less than threshold, reset swiping item
    if (swipeDistance < 40) {
      setSwipingItemId(null);
    }
    // Otherwise, keep the item in swiped state for delete action
  }, [swipeStartX, swipeCurrentX]);

  // Delete notification or message
  const handleDelete = useCallback(
    (id: string, type: "notification" | "message") => {
      if (type === "notification") {
        setNotificationsData((prev) => prev.filter((item) => item.id !== id));
        setDeletedNotifications((prev) => [...prev, id]);
      } else {
        setMessagesData((prev) => prev.filter((item) => item.id !== id));
        setDeletedMessages((prev) => [...prev, id]);
      }
      setSwipingItemId(null);
    },
    [],
  );

  // Restore notifications and messages
  const handleRestoreNotifications = useCallback(() => {
    setNotificationsSilenced(false);
    setMessagesSilenced(false);
    setSilenceEndTime(null);
  }, []);

  // Handle silencing notifications
  const handleSilenceNotifications = (
    duration: string,
    type: "all" | "messages" | "notifications",
  ) => {
    setSilenceDuration(duration);
    setSilenceType(type);

    let endTime = new Date();
    switch (duration) {
      case "30m":
        endTime.setMinutes(endTime.getMinutes() + 30);
        break;
      case "1h":
        endTime.setHours(endTime.getHours() + 1);
        break;
      case "8h":
        endTime.setHours(endTime.getHours() + 8);
        break;
      case "24h":
        endTime.setHours(endTime.getHours() + 24);
        break;
      default:
        endTime.setHours(endTime.getHours() + 1);
    }

    setSilenceEndTime(endTime);

    if (type === "all" || type === "notifications") {
      setNotificationsSilenced(true);
    }
    if (type === "all" || type === "messages") {
      setMessagesSilenced(true);
    }
  };

  // Open silence dialog with specific type
  const openSilenceDialog = (type: "all" | "messages" | "notifications") => {
    setSilenceType(type);
    setIsSilenceDialogOpen(true);
  };

  // Handle sending a reply to a message
  const handleSendReply = (
    replyText: string,
    attachments?: Array<{ type: string; url: string; name?: string }>,
  ) => {
    if (!selectedMessageForReply) return;

    // Create a new message as a reply
    const newMessage = {
      id: `reply-${Date.now()}`,
      sender: "Você",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      message: replyText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: "Agora mesmo",
      unread: false,
      attachments: attachments || [],
    };

    // Add the new message to the beginning of the list
    setMessagesData((prev) => [newMessage, ...prev]);

    // Mark the original message as read and increment response count
    const updatedMessages = messagesData.map((item) =>
      item.id === selectedMessageForReply.id
        ? {
            ...item,
            unread: false,
            responseCount: (item.responseCount || 0) +1,
          }
        : item,
    );
    setMessagesData(updatedMessages);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Verificar se é o comando secreto de debug
      if (searchQuery.trim().toLowerCase() === "debug school power") {
        // Ativar debug mode
        const debugEvent = new CustomEvent('activateDebugMode');
        window.dispatchEvent(debugEvent);
        
        // Feedback visual
        const notification = document.createElement('div');
        notification.className = 'fixed top-24 right-4 z-[10000] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-300';
        notification.innerHTML = '🔍 Debug Mode Ativado!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.classList.add('animate-out', 'fade-out', 'slide-out-to-top-2');
          setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        setSearchQuery('');
        setIsSearchFocused(false);
        return;
      }
      
      console.log("Searching for:", searchQuery);
      // Implement actual search functionality here
      setIsSearchFocused(false);
    }
  };

  // Handle click outside of search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
            // Skip if we're generating suggestions or if the dropdown isn't open
      if (isGeneratingAiSuggestions || !isSearchFocused) return;

      // Check if click is inside the dropdown or search input
      const target = e.target as Node;
      if (
        suggestionsDropdownRef.current &&
        !suggestionsDropdownRef.current.contains(target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(target)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchFocused, isGeneratingAiSuggestions]);

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDark(darkMode);

    // Carregar perfil do usuário
    const loadUserProfile = async () => {
      const profile = await profileService.getCurrentUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    };

    loadUserProfile();
  }, []);

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      // Primeiro limpar dados de autenticação do localStorage
      localStorage.removeItem('auth_status');
      localStorage.removeItem('auth_checked');

      // Depois realizar signOut no Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      console.log("Usuário deslogado com sucesso");

      // Disparar evento de logout
      window.dispatchEvent(new CustomEvent('logout'));

      // Pequeno delay para garantir que o evento foi processado
      setTimeout(() => {
        // Forçar redirecionamento para a página de login
        window.location.href = "/login";
      }, 100);
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      // Em caso de erro, ainda tentar redirecionar
      window.location.href = "/login";
    }
  };

    // Determine if the theme is light or dark
  const isLightMode = theme === 'light' || (!isDark && theme !== 'dark');

  return (
    <header className="w-full h-[72px] px-6 bg-white dark:bg-[#0A2540] border-b border-brand-border dark:border-white/10 flex items-center justify-between">
      {/* Hidden audio element for notification sounds */}
      <audio ref={audioRef} src="/message-sound.mp3" preload="auto" />


      {/* Silence Notifications Dialog */}
      <Dialog open={isSilenceDialogOpen} onOpenChange={setIsSilenceDialogOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/90 dark:bg-[#0A2540]/90 border border-[#FF6B00]/30 shadow-lg">
          <DialogHeader>
            <DialogTitle>
              {silenceType === "all" && "Silenciar Todas as Notificações"}
              {silenceType === "messages" && "Silenciar Mensagens"}
              {silenceType === "notifications" && "Silenciar Notificações"}
            </DialogTitle>
            <DialogDescription>
              Por quanto tempo você deseja silenciar as{" "}
              {silenceType === "messages"
                ? "mensagens"
                : silenceType === "notifications"
                  ? "notificações"
                  : "notificações e mensagens"}
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={silenceDuration}
              onValueChange={setSilenceDuration}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30m" id="30m" />
                <Label htmlFor="30m">30 minutos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1h" id="1h" />
                <Label htmlFor="1h">1 hora</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="8h" id="8h" />
                <Label htmlFor="8h">8 horas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="24h" id="24h" />
                <Label htmlFor="24h">24 horas</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSilenceDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                handleSilenceNotifications(silenceDuration, silenceType);
                setIsSilenceDialogOpen(false);
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guia Avatar */}
      <div className="flex items-center">
        <GuiaAvatar className="mr-6" />
      </div>

      {/* Minimalist Search Bar */}
      <div className="flex-1 max-w-2xl mx-auto px-6">
        <div className="relative group flex items-center">
          <div className="relative group flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 dark:text-gray-500 transition-all duration-300 group-hover:text-[#FF6B00] dark:group-hover:text-[#FF6B00]">
              <Search className="h-4 w-4" />
            </div>
          <div className="relative w-full">
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Pesquisar..."
              className="w-full pl-9 pr-16 py-2 h-10 rounded-full bg-gray-50 dark:bg-[#001F3F]/30 border border-gray-200 dark:border-gray-700 text-brand-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#FF6B00]/20 dark:focus:ring-[#FF6B00]/20 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-[#FF6B00]/10 focus:border-[#FF6B00]/50 dark:focus:border-[#FF6B00]/50 focus:scale-[1.02] focus:bg-white dark:focus:bg-[#001F3F]/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSearchSubmit();
                }
              }}
            />
            {searchQuery.trim() && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-full h-7 w-7 flex items-center justify-center transition-colors duration-200"
                onClick={handleSearchSubmit}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            )}
          </div>

          {isSearchFocused && (
            <div
              ref={suggestionsDropdownRef}
              className="search-suggestions-dropdown absolute top-full left-0 right-0 mt-2 backdrop-blur-md bg-white/90 dark:bg-[#0A2540]/90 rounded-lg shadow-lg border border-[#FF6B00]/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sugestões de pesquisa:
                </p>
                <div className="h-8 flex items-center">
                  <span className="text-[#FF6B00] font-medium">
                    {typingEffect.text}
                    <span className="animate-pulse inline-block ml-0.5 h-4 w-0.5 bg-[#FF6B00]">
                      |
                    </span>
                  </span>
                </div>
              </div>
              <div className="p-2">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors duration-150 flex items-center gap-2"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setIsSearchFocused(false);
                    }}
                  >
                    <Search className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}

                {aiSuggestions.length > 0 && (
                  <>
                    <div className="mt-3 mb-2 px-2">
                      <div className="h-px w-full bg-gradient-to-r from-[#FF6B00]/20 via-[#FF6B00] to-[#FF6B00]/20 dark:from-[#FF6B00]/30 dark:via-[#FF6B00] dark:to-[#FF6B00]/30"></div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <Brain className="h-4 w-4 text-[#FF6B00] animate-pulse" />
                          <p className="text-sm font-medium text-[#FF6B00] dark:text-[#FF8C40]">
                            Sugestões do Epictus IA
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 px-1">
                      {aiSuggestions.map((suggestion, index) => (
                        <div
                          key={`ai-${index}`}
                          className="p-2 bg-[#FF6B00]/5 hover:bg-[#FF6B00]/10 dark:bg-[#FF6B00]/10 dark:hover:bg-[#FF6B00]/20 rounded-md cursor-pointer transition-all duration-200 flex items-center gap-2 hover:translate-x-1"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setIsSearchFocused(false);
                          }}
                        >
                          <Brain className="h-4 w-4 text-[#FF6B00]" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {suggestion}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    className="ai-suggestion-button w-full p-3 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-md transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Force focus to remain on search input
                      setIsSearchFocused(true);
                      generateAiSuggestions();
                    }}
                    disabled={isGeneratingAiSuggestions}
                  >
                    {isGeneratingAiSuggestions ? (
                      <>
                        <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <span className="text-sm font-medium">
                          Gerando sugestões...
                        </span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Gerar mais sugestões com Epictus IA
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-6 ml-6">
        <LoginDiario onClick={() => {
          console.log("Login diário realizado!");
        }} />

        <Popover
          open={isNotificationsOpen}
          onOpenChange={setIsNotificationsOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-brand-card dark:hover:bg-white/5"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-brand-black dark:text-white" />
              {notificationsData.some((notif) => !notif.read) &&
                !notificationsSilenced && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF6B00] text-white text-xs rounded-full animate-pulse">
                    {notificationsData.filter((notif) => !notif.read).length}
                  </Badge>
                )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0 popover-content-modern backdrop-blur-md bg-white/80 dark:bg-[#0A2540]/80 border border-[#FF6B00]/30 shadow-lg shadow-[#FF6B00]/5"
            align="end"
          >
            <div className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 border-b rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notificações</h3>
                  <BellRing className="h-4 w-4 text-orange-500 animate-pulse-custom" />
                  <p className="text-xs text-muted-foreground">
                    Atualizações e avisos da plataforma
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-white/20"
                          onClick={() => openSilenceDialog("notifications")}
                        >
                          {notificationsSilenced ? (
                            <BellOff className="h-4 w-4 text-red-500" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {notificationsSilenced
                          ? "Notificações silenciadas"
                          : "Silenciar notificações"}
                        {silenceEndTime && notificationsSilenced && (
                          <div className="text-xs mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Até{" "}
                            {silenceEndTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-white/20"
                          onClick={() => {
                            // Implementar integração com Epictus IA para notificações
                            console.log(
                              "Integração com Epictus IA para notificações",
                            );
                          }}
                        >
                          <Brain className="h-4 w-4 text-[#FF6B00]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Epictus IA - Filtrar notificações
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            <ScrollArea className="h-80">
              <div className="p-0">
                {notificationsData.length > 0 ? (
                  notificationsData.map((notification) => (
                    <div
                      key={notification.id}
                      className={`swipeable-item ${swipingItemId === notification.id ? "swipe-delete-active" : ""}`}
                      onTouchStart={(e) => handleTouchStart(e, notification.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={(e) => handleTouchStart(e, notification.id)}
                      onMouseMove={handleTouchMove}
                      onMouseUp={handleTouchEnd}
                      onMouseLeave={handleTouchEnd}
                    >
                      <div
                        className={`swipeable-content p-3 hover:bg-orange-50 dark:hover:bg-orange-900/10 cursor-pointer border-b last:border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-md group ${notification.id.startsWith("auto-") && !notification.read ? "animate-highlight" : "animate-fadeIn"} ${!notification.read ? "bg-orange-50 dark:bg-orange-900/20" : ""}`}
                        onClick={() => {
                          // Mark this notification as read
                          const updatedNotifications = notificationsData.map(
                            (item) =>
                              item.id === notification.id
                                ? { ...item, read: true }
                                : item,
                          );
                          setNotificationsData(updatedNotifications);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${notification.type === "update" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : notification.type === "warning" ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"}`}
                          >
                            {notification.type === "update" && (
                              <Upload className="h-4 w-4" />
                            )}
                            {notification.type === "warning" && (
                              <Bell className="h-4 w-4" />
                            )}
                            {notification.type === "info" && (
                              <MessageCircle className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium group-hover:text-[#FF6B00] transition-colors duration-200">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <Badge className="bg-[#FF6B00] text-white text-[10px] px-1.5 py-0 rounded-full animate-pulse group-hover:bg-[#FF8C40] transition-colors duration-200">
                                  Nova
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {notification.description}
                            </p>
                            <span className="text-xs text-mutedforeground">
                              {notification.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="delete-button"
                        onClick={() =>
                          handleDelete(notification.id, "notification")
                        }
                      >
                        <X className="h-5 w-5" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
                    <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Você não tem notificações
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      As novas notificações aparecerão aqui
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-3 border-t flex justify-end items-center bg-gray-50 dark:bg-gray-800 rounded-b-xl">
              <div className="flex items-center gap-2">
                {notificationsSilenced && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors duration-200"
                    onClick={handleRestoreNotifications}
                  >
                    <BellRing className="h-3 w-3 mr-1" />
                    Restaurar notificações
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setNotificationsData([])}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
                <Button
                  size="sm"
                  className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  variant="outline"
                  onClick={() => {
                    const updatedNotifications = notificationsData.map(
                      (notif) => ({
                        ...notif,
                        read: true,
                      }),
                    );
                    setNotificationsData(updatedNotifications);
                  }}
                >
                  Marcar todas como lidas
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ThemeToggle />

        <PerfilCabecalho />
      </div>

      {/* Message Reply Modal */}
      <MessageReplyModal
        isOpen={isReplyModalOpen}
        onOpenChange={setIsReplyModalOpen}
        message={selectedMessageForReply}
        onSendReply={handleSendReply}
      />
    </header>
  );
}