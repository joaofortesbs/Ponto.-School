import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GuiaAvatar from "../GuiaAvatar";
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
import { supabase } from "@/integrations/supabase/client";
import CalendarioSchoolPanel from "@/pages/calendario-school/card-modal/interface";

// Configuração milimétrica do cabeçalho flutuante - matching PromotionalBanner
const HEADER_HEIGHT = 64; // Altura aumentada para 64px (8px a mais para melhor proporção)
const HEADER_MARGIN_TOP = 16; // Margem superior (igual ao sidebar)
const HEADER_PADDING_HORIZONTAL = 20; // Padding horizontal interno
const HEADER_BORDER_RADIUS = 9999; // Bordas completamente arredondadas
const AVATAR_LEFT_OFFSET = 8; // Offset negativo para empurrar avatar mais para a esquerda (perfeito, milimetrico e exato)
// Max width is controlled by container: max-w-[98%] sm:max-w-[1600px]

export default function CabecalhoFlutuante() {
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
  const [isSilenceDialogOpen, setIsSilenceDialogOpen] = useState(false);
  const [silenceDuration, setSilenceDuration] = useState("1h");
  const [notificationsSilenced, setNotificationsSilenced] = useState(false);
  const [silenceEndTime, setSilenceEndTime] = useState<Date | null>(null);
  const [swipingItemId, setSwipingItemId] = useState<string | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeCurrentX, setSwipeCurrentX] = useState<number | null>(null);
  const [deletedNotifications, setDeletedNotifications] = useState<string[]>(
    [],
  );
  const [silenceType, setSilenceType] = useState<
    "notifications"
  >("notifications");
  const [lastAutoNotificationTime, setLastAutoNotificationTime] =
    useState<Date | null>(null);
  const [currentNotificationType, setCurrentNotificationType] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingAiSuggestions, setIsGeneratingAiSuggestions] =
    useState(false);
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const searchSuggestions = [
    "Como usar a IA da plataforma?",
    "Como adicionar amigos?",
    "Como ganhar Sparks?",
    "Como posso começar os meus estudos de hoje?",
  ];

  const allAiSuggestionSets = [
    [
      "Como melhorar meu desempenho em matemática?",
      "Quais são os próximos eventos da plataforma?",
      "Como criar um grupo de estudos personalizado?",
    ],
    [
      "Quais são as novidades da semana?",
      "Como eu posso usar o Epictus IA para melhorar meu estudos?",
      "Como eu posso acessar as Minhas Turmas?",
    ],
    [
      "Quais são as premiações do mês?",
      "Como eu posso organizar a minha rotina?",
      "Como eu posso personalizar o meu perfil dentro da Ponto. School?",
    ],
    [
      "Como fazer recargas dentro da Ponto. School?",
      "Como eu posso trocar as minhas Stars?",
      "Como eu posso participar da Trilha School?",
    ],
    [
      "Como eu posso crescer o meu engajamento com a Ponto. School?",
      "Qual é o livro do mês do clube do livro?",
      "Como participar da Jornada de Conhecimento?",
    ],
    [
      "Como eu posso ganhar STs com a Conexão Expert?",
      "Como eu posso participar de um clube do Livro com a Ponto. School?",
      "Como eu posso ver o meu desempenho nas notas escolares?",
    ],
    [
      "Como eu posso trocar itens dentro da Ponto. School?",
      "Como eu posso organizar o meu trabalho em grupo?",
      "Como eu posso criar os meus próprios eventos?",
    ],
  ];

  const [currentSuggestionSetIndex, setCurrentSuggestionSetIndex] = useState(0);

  const generateAiSuggestions = () => {
    setIsGeneratingAiSuggestions(true);
    setIsSearchFocused(true);

    const keepFocused = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsSearchFocused(true);
    };

    document.addEventListener("click", keepFocused, { capture: true });
    document.addEventListener("mousedown", keepFocused, { capture: true });
    document.addEventListener("mouseup", keepFocused, { capture: true });

    setTimeout(() => {
      const nextIndex =
        (currentSuggestionSetIndex + 1) % allAiSuggestionSets.length;
      const newSuggestions = allAiSuggestionSets[nextIndex];

      setAiSuggestions(newSuggestions);
      setCurrentSuggestionSetIndex(nextIndex);
      setIsGeneratingAiSuggestions(false);

      setTimeout(() => {
        document.removeEventListener("click", keepFocused, { capture: true });
        document.removeEventListener("mousedown", keepFocused, {
          capture: true,
        });
        document.removeEventListener("mouseup", keepFocused, { capture: true });
      }, 300);
    }, 1500);
  };

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
        if (!prev.isTyping && !prev.isDeleting) {
          return {
            ...prev,
            isTyping: true,
            isDeleting: false,
            text: suggestion.charAt(0),
            fullText: suggestion,
          };
        }

        if (prev.isTyping && prev.text.length < prev.fullText.length) {
          const nextChar = prev.fullText.charAt(prev.text.length);
          const newText = prev.text + nextChar;

          return {
            ...prev,
            text: newText,
          };
        }

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

        if (prev.isDeleting && prev.text.length > 0) {
          const newText = prev.text.substring(0, prev.text.length - 1);

          return {
            ...prev,
            text: newText,
          };
        }

        if (prev.isDeleting && prev.text.length === 0) {
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

  const [notificationsData, setNotificationsData] = useState(notifications);

  useEffect(() => {
    let silenceTimer: NodeJS.Timeout;

    if (silenceEndTime) {
      const timeUntilEnd = silenceEndTime.getTime() - Date.now();

      if (timeUntilEnd > 0) {
        silenceTimer = setTimeout(() => {
          setNotificationsSilenced(false);
          setSilenceEndTime(null);
        }, timeUntilEnd);
      } else {
        setNotificationsSilenced(false);
        setSilenceEndTime(null);
      }
    }

    return () => clearTimeout(silenceTimer);
  }, [silenceEndTime, silenceType]);

  const generateAutoNotification = () => {
    if (notificationsSilenced) return;

    const typeIndex = currentNotificationType % notificationTypes.length;
    const notificationType = notificationTypes[typeIndex];

    const titleIndex = Math.floor(
      Math.random() * notificationType.titles.length,
    );
    const descIndex = Math.floor(
      Math.random() * notificationType.descriptions.length,
    );

    const title = notificationType.titles[titleIndex];
    const description = notificationType.descriptions[descIndex];

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

    setNotificationsData((prev) => [newNotification, ...prev]);

    if (audioRef.current) {
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log("Notificação silenciosa (interação do usuário necessária)");
          });
        }
      } catch (err) {
      }
    }

    setLastAutoNotificationTime(new Date());
    setCurrentNotificationType((prev) => prev + 1);
  };

  useEffect(() => {
    audioRef.current = new Audio("/message-sound.mp3");
    audioRef.current.volume = 0.5;

    setSessionStartTime(new Date());

    const intervalId = setInterval(() => {
      const now = new Date();
      const timeSinceLastNotification = lastAutoNotificationTime
        ? now.getTime() - lastAutoNotificationTime.getTime()
        : now.getTime() - sessionStartTime.getTime();

      if (timeSinceLastNotification >= 900000) {
        generateAutoNotification();
      }
    }, 60000);

    const initialTimeoutId = setTimeout(() => {
      generateAutoNotification();
    }, 60000);

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

    const defaultLogo =
      window.PONTO_SCHOOL_CONFIG?.defaultLogo ||
      "/images/ponto-school-logo.webp";

    setCustomLogo(defaultLogo);

    const loadAndConfigureLogo = (logoUrl = null) => {
      try {
        if (logoUrl) {
          setCustomLogo(logoUrl);
          setIsLoading(false);
          return;
        }

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

        const savedLogo = localStorage.getItem("customLogo");
        if (savedLogo && savedLogo !== "null" && savedLogo !== "undefined") {
          setCustomLogo(savedLogo);
          setIsLoading(false);
          if (window.PONTO_SCHOOL_CONFIG) {
            window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
          }
        } else {
          setCustomLogo(defaultLogo);
          localStorage.setItem("customLogo", defaultLogo);
          localStorage.setItem("pontoSchoolLogo", defaultLogo);
          localStorage.setItem("logoPreloaded", "true");
          setIsLoading(false);
        }
      } catch (e) {
        console.warn("Erro ao acessar localStorage no Header", e);
        setCustomLogo(defaultLogo);
        setIsLoading(false);
      }
    };

    const preloadImg = new Image();
    preloadImg.src = defaultLogo;
    preloadImg.fetchPriority = "high";
    preloadImg.crossOrigin = "anonymous";

    preloadImg.onload = () => {
      console.log("Logo carregada com sucesso no Header");
      loadAndConfigureLogo();
      document.dispatchEvent(
        new CustomEvent("logoLoaded", { detail: { url: defaultLogo } }),
      );
    };

    preloadImg.onerror = () => {
      console.warn("Erro ao carregar logo padrão");
      loadAndConfigureLogo();
    };

    const handleLogoChange = ((event: CustomEvent) => {
      const newLogoUrl = event.detail?.url;
      if (newLogoUrl) {
        loadAndConfigureLogo(newLogoUrl);
      }
    }) as EventListener;

    window.addEventListener("logoChanged", handleLogoChange);

    return () => {
      window.removeEventListener("logoChanged", handleLogoChange);
    };
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoData = reader.result as string;
        setCustomLogo(logoData);
        localStorage.setItem("customLogo", logoData);
        localStorage.setItem("pontoSchoolLogo", logoData);

        if (window.PONTO_SCHOOL_CONFIG) {
          window.PONTO_SCHOOL_CONFIG.defaultLogo = logoData;
          window.PONTO_SCHOOL_CONFIG.logoLoaded = true;
        }

        window.dispatchEvent(
          new CustomEvent("logoChanged", { detail: { url: logoData } }),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    const defaultLogo =
      window.PONTO_SCHOOL_CONFIG?.defaultLogo ||
      "/images/ponto-school-logo.webp";
    setCustomLogo(defaultLogo);
    localStorage.setItem("customLogo", defaultLogo);
    localStorage.setItem("pontoSchoolLogo", defaultLogo);

    if (window.PONTO_SCHOOL_CONFIG) {
      window.PONTO_SCHOOL_CONFIG.defaultLogo = defaultLogo;
    }

    window.dispatchEvent(
      new CustomEvent("logoChanged", { detail: { url: defaultLogo } }),
    );
  };

  const handleSwipeStart = (e: React.TouchEvent, itemId: string) => {
    setSwipingItemId(itemId);
    setSwipeStartX(e.touches[0].clientX);
    setSwipeCurrentX(e.touches[0].clientX);
  };

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (swipeStartX !== null) {
      setSwipeCurrentX(e.touches[0].clientX);
    }
  };

  const handleSwipeEnd = (itemId: string, type: "notification") => {
    if (swipeStartX !== null && swipeCurrentX !== null) {
      const swipeDistance = swipeStartX - swipeCurrentX;
      if (swipeDistance > 100) {
        handleDelete(itemId, type);
      }
    }
    setSwipingItemId(null);
    setSwipeStartX(null);
    setSwipeCurrentX(null);
  };

  const handleDelete = (itemId: string, type: "notification") => {
    setNotificationsData(notificationsData.filter((n) => n.id !== itemId));
    setDeletedNotifications([...deletedNotifications, itemId]);
  };

  const getSwipeOffset = (itemId: string) => {
    if (swipingItemId === itemId && swipeStartX !== null && swipeCurrentX !== null) {
      const offset = swipeStartX - swipeCurrentX;
      return offset > 0 ? Math.min(offset, 100) : 0;
    }
    return 0;
  };

  const handleSilenceNotifications = (
    duration: string,
  ) => {
    const now = new Date();
    let endTime: Date;

    switch (duration) {
      case "30m":
        endTime = new Date(now.getTime() + 30 * 60 * 1000);
        break;
      case "1h":
        endTime = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case "8h":
        endTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        break;
      case "24h":
        endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      default:
        endTime = new Date(now.getTime() + 60 * 60 * 1000);
    }

    setSilenceEndTime(endTime);
    setSilenceType("notifications");
    setNotificationsSilenced(true);
  };

  const handleRestoreNotifications = () => {
    setNotificationsSilenced(false);
    setSilenceEndTime(null);
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
    setIsSearchFocused(false);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('auth_status');
      localStorage.removeItem('auth_checked');

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      console.log("Usuário deslogado com sucesso");

      window.dispatchEvent(new CustomEvent('logout'));

      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      window.location.href = "/login";
    }
  };

  const isLightMode = theme === 'light' || (!isDark && theme !== 'dark');

  return (
    <>
    <header
      className="w-full bg-white dark:bg-[#030C2A] border border-gray-200 dark:border-white/10 flex items-center justify-between shadow-lg backdrop-blur-sm relative z-[10000]"
      style={{
        height: `${HEADER_HEIGHT}px`,
        borderRadius: `${HEADER_BORDER_RADIUS}px`,
        paddingLeft: `${HEADER_PADDING_HORIZONTAL}px`,
        paddingRight: `${HEADER_PADDING_HORIZONTAL}px`,
      }}
    >
          <audio ref={audioRef} src="/message-sound.mp3" preload="auto" />

        <Dialog open={isSilenceDialogOpen} onOpenChange={setIsSilenceDialogOpen}>
          <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/90 dark:bg-[#030C2A]/90 border border-[#FF6B00]/30 shadow-lg">
            <DialogHeader>
              <DialogTitle>Silenciar Notificações</DialogTitle>
              <DialogDescription>
                Por quanto tempo você deseja silenciar as notificações?
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
                  handleSilenceNotifications(silenceDuration);
                  setIsSilenceDialogOpen(false);
                }}
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div style={{ marginLeft: `-${AVATAR_LEFT_OFFSET}px` }}>
          <GuiaAvatar />
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={isSearchFocused ? typingEffect.text : "Pesquisar..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => {
                  if (!suggestionsDropdownRef.current?.contains(document.activeElement)) {
                    setIsSearchFocused(false);
                  }
                }, 200);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery) {
                  handleSearch(searchQuery);
                  setIsSearchFocused(false);
                }
              }}
              className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-[#1a3a52] border-none rounded-full focus:ring-2 focus:ring-[#FF6B00]/50"
            />
            {isSearchFocused && (
              <div
                ref={suggestionsDropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#030C2A] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <div className="p-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    Sugestões
                  </p>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <Separator />
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Sugestões da IA
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs text-[#FF6B00] hover:text-[#FF6B00]/80"
                      onClick={generateAiSuggestions}
                      disabled={isGeneratingAiSuggestions}
                    >
                      {isGeneratingAiSuggestions ? (
                        <span className="flex items-center gap-1">
                          <span className="animate-spin">⟳</span> Gerando...
                        </span>
                      ) : (
                        "Gerar novas"
                      )}
                    </Button>
                  </div>
                  {aiSuggestions.length > 0 ? (
                    aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex items-center gap-2"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Zap className="h-3 w-3 text-[#FF6B00]" />
                        {suggestion}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">
                      Clique em "Gerar novas" para obter sugestões personalizadas
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsCalendarOpen(true)}
                >
                  <Calendar className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Calendário</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bell className="h-5 w-5" />
                {notificationsData.filter((n) => !n.read).length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF6B00] text-white text-xs">
                    {notificationsData.filter((n) => !n.read).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold">Notificações</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setSilenceType("notifications");
                    setIsSilenceDialogOpen(true);
                  }}
                >
                  <BellOff className="h-4 w-4 mr-1" />
                  Silenciar
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-2">
                  {notificationsData.length > 0 ? (
                    notificationsData.map((notification) => (
                      <div
                        key={notification.id}
                        className="relative overflow-hidden mb-2"
                        onTouchStart={(e) => handleSwipeStart(e, notification.id)}
                        onTouchMove={handleSwipeMove}
                        onTouchEnd={() =>
                          handleSwipeEnd(notification.id, "notification")
                        }
                      >
                        <div
                          className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-transform ${
                            !notification.read
                              ? "bg-[#FF6B00]/5"
                              : ""
                          }`}
                          style={{
                            transform: `translateX(-${getSwipeOffset(notification.id)}px)`,
                          }}
                        >
                          <div
                            className={`p-2 rounded-full ${
                              notification.type === "update"
                                ? "bg-blue-100 text-blue-600"
                                : notification.type === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {notification.type === "update" ? (
                              <Zap className="h-4 w-4" />
                            ) : notification.type === "warning" ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {notification.description}
                            </p>
                            <span className="text-xs text-mutedforeground">
                              {notification.date}
                            </span>
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
      </header>

      <CalendarioSchoolPanel
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </>
  );
}
