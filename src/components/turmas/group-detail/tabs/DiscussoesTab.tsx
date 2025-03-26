import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MessageCircle,
  Search,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreHorizontal,
  ThumbsUp,
  Pin,
  Trash2,
  FileText,
  X,
  ChevronDown,
  Phone,
  Video as VideoIcon,
  Maximize,
  Star,
  Eye as EyeIcon,
  Copy,
  Share2,
  Settings,
  Info,
  Check,
  Download,
} from "lucide-react";

interface DiscussoesTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  groupName?: string;
}

type MessageType = "text" | "image" | "file" | "video" | "audio";

type VoteType = "up" | "down" | null;

interface Message {
  id: number;
  content: string;
  sender: string;
  senderAvatar: string;
  timestamp: string;
  type: MessageType;
  fileInfo?: {
    name: string;
    size: string;
    type: string;
  };
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: string;
  reactions?: {
    type: string;
    count: number;
    users: string[];
  }[];
  votes?: {
    up: string[];
    down: string[];
  };
  isTranslated?: boolean;
  translatedContent?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  isSelected?: boolean;
  isFavorite?: boolean;
  replyTo?: {
    id: number;
    sender: string;
    content: string;
  };
  readStatus?: "sent" | "delivered" | "read";
}

export const DiscussoesTab: React.FC<DiscussoesTabProps> = ({
  searchQuery,
  setSearchQuery,
  groupName = "Mecânica Quântica Avançada",
}) => {
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState<number | null>(
    null,
  );
  const [showMessageDetails, setShowMessageDetails] = useState<number | null>(
    null,
  );
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showReactions, setShowReactions] = useState<number | null>(null);
  const [showVotes, setShowVotes] = useState<number | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Sample messages for the group chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Eu comecei ontem, mas estou com dúvidas no exercício 5. Podemos discutir na próxima reunião?",
      sender: "Ana Silva",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      timestamp: "Hoje, 10:45",
      type: "text",
      readStatus: "read",
      votes: { up: [], down: [] },
    },
    {
      id: 2,
      content:
        "Claro! Eu também tive dificuldades nesse exercício. Vamos marcar um horário para estudarmos juntos antes da próxima aula.",
      sender: "Pedro Costa",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
      timestamp: "Hoje, 10:38",
      type: "text",
      readStatus: "read",
      votes: { up: ["Ana"], down: [] },
      reactions: [{ type: "👍", count: 1, users: ["Ana"] }],
    },
    {
      id: 3,
      content:
        "Pessoal, encontrei este artigo que pode ajudar com o exercício 5. Dá uma olhada!",
      sender: "Maria Oliveira",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      timestamp: "Hoje, 10:30",
      type: "text",
      readStatus: "read",
      votes: { up: [], down: [] },
    },
    {
      id: 4,
      content: "Artigo: Resolução de Problemas Quânticos",
      sender: "Maria Oliveira",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      timestamp: "Hoje, 10:30",
      type: "file",
      readStatus: "read",
      votes: { up: [], down: [] },
      fileInfo: {
        name: "resolucao_problemas_quanticos.pdf",
        size: "1.5 MB",
        type: "pdf",
      },
    },
    {
      id: 5,
      content:
        "Obrigada Maria! Vou ler hoje à noite. Alguém quer fazer uma videochamada amanhã às 19h para discutirmos?",
      sender: "Ana Silva",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      timestamp: "Hoje, 10:45",
      type: "text",
      readStatus: "read",
      votes: { up: ["Pedro", "Maria"], down: [] },
      reactions: [{ type: "👍", count: 2, users: ["Pedro", "Maria"] }],
    },
  ]);

  // Set the pinned message based on the messages array
  React.useEffect(() => {
    const pinned = messages.find((msg) => msg.isPinned);
    if (pinned) {
      setPinnedMessage(pinned);
    }
  }, [messages]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: messageText,
      sender: "Você", // Current user
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Voce",
      timestamp: "Agora",
      type: "text",
      readStatus: "sent",
      votes: { up: [], down: [] },
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            sender: replyingTo.sender,
            content: replyingTo.content,
          }
        : undefined,
    };

    setMessages([...messages, newMessage]);
    setMessageText("");
    setReplyingTo(null);

    // Simulate message being delivered and then read
    setTimeout(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, readStatus: "delivered" } : msg,
        ),
      );

      // Simulate message being read after delivery
      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newMessage.id ? { ...msg, readStatus: "read" } : msg,
          ),
        );
      }, 2000);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReaction = (messageId: number, reaction: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          const existingReaction = existingReactions.find(
            (r) => r.type === reaction,
          );

          if (existingReaction) {
            // Check if user already reacted
            if (existingReaction.users.includes("Você")) {
              // Remove reaction if already exists
              existingReaction.users = existingReaction.users.filter(
                (u) => u !== "Você",
              );
              existingReaction.count -= 1;

              // Remove the reaction entirely if no users left
              if (existingReaction.count === 0) {
                return {
                  ...msg,
                  reactions: existingReactions.filter(
                    (r) => r.type !== reaction,
                  ),
                };
              }
            } else {
              // Add current user to the reaction
              existingReaction.users.push("Você");
              existingReaction.count += 1;
            }
          } else {
            // Add new reaction
            existingReactions.push({
              type: reaction,
              count: 1,
              users: ["Você"],
            });
          }

          return { ...msg, reactions: existingReactions };
        }
        return msg;
      }),
    );
    setShowReactions(null);
  };

  const addVote = (messageId: number, voteType: VoteType) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const votes = msg.votes || { up: [], down: [] };

          // Remove existing vote if any
          const upIndex = votes.up.indexOf("Você");
          const downIndex = votes.down.indexOf("Você");

          if (upIndex > -1) {
            votes.up.splice(upIndex, 1);
          }

          if (downIndex > -1) {
            votes.down.splice(downIndex, 1);
          }

          // Add new vote if not removing
          if (voteType === "up") {
            votes.up.push("Você");
          } else if (voteType === "down") {
            votes.down.push("Você");
          }

          return { ...msg, votes };
        }
        return msg;
      }),
    );
  };

  const translateMessage = (messageId: number) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          // In a real app, this would call a translation API
          // For demo purposes, we'll just add "[Traduzido]" prefix
          return {
            ...msg,
            isTranslated: !msg.isTranslated,
            translatedContent: !msg.isTranslated
              ? `[Traduzido] ${msg.content}`
              : undefined,
          };
        }
        return msg;
      }),
    );
    setShowMessageOptions(null);
  };

  const handleDeleteMessage = (message: Message, deleteForAll: boolean) => {
    if (deleteForAll) {
      // Delete for everyone
      setMessages(messages.filter((msg) => msg.id !== message.id));
    } else {
      // Delete just for current user (in a real app, this would be stored in user preferences)
      // For demo, we'll just remove it from the list
      setMessages(messages.filter((msg) => msg.id !== message.id));
    }

    if (pinnedMessage && pinnedMessage.id === message.id) {
      setPinnedMessage(null);
    }

    setShowDeleteModal(false);
    setMessageToDelete(null);
    setShowMessageOptions(null);
  };

  const toggleMessageSelection = (messageId: number) => {
    if (!isSelectionMode) return;

    setSelectedMessages((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter((id) => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const pinMessage = (messageId: number) => {
    setMessages(
      messages.map((msg) => {
        // Unpin all messages first
        const unpinned = { ...msg, isPinned: false };

        // Then pin the selected message
        if (unpinned.id === messageId) {
          return { ...unpinned, isPinned: true };
        }
        return unpinned;
      }),
    );
    setShowMessageOptions(null);
  };

  const deleteMessage = (messageId: number) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
    if (pinnedMessage && pinnedMessage.id === messageId) {
      setPinnedMessage(null);
    }
    setShowMessageOptions(null);
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // In a real app, this would process the audio recording
    const newMessage = {
      id: messages.length + 1,
      content: "Mensagem de áudio",
      sender: "Você",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Voce",
      timestamp: "Agora",
      type: "audio" as MessageType,
      audioDuration: formatTime(recordingTime),
      readStatus: "sent",
      votes: { up: [], down: [] },
    };

    setMessages([...messages, newMessage]);

    // Simulate message being delivered and then read
    setTimeout(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, readStatus: "delivered" } : msg,
        ),
      );

      // Simulate message being read after delivery
      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newMessage.id ? { ...msg, readStatus: "read" } : msg,
          ),
        );
      }, 2000);
    }, 1000);
  };

  const cancelRecording = () => {
    setIsRecording(false);
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case "text":
        return (
          <p className="text-sm text-white whitespace-pre-wrap">
            {message.isTranslated ? message.translatedContent : message.content}
          </p>
        );

      case "file":
        if (!message.fileInfo) return null;

        return (
          <div className="mt-1">
            <div className="flex items-center p-2 rounded-lg">
              <div className="mr-3 p-1 rounded-lg">
                <FileText className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {message.fileInfo.name}
                </p>
                <p className="text-xs text-gray-400">{message.fileInfo.size}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-gray-400"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="mt-1">
            <div className="flex items-center p-2 rounded-lg">
              <audio controls className="w-full max-w-[200px] h-8" />
              <span className="text-xs text-gray-400 ml-2">
                {message.audioDuration}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderMessageDetails = (message: Message) => {
    if (showMessageDetails !== message.id) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-[#1e293b] w-full max-w-md rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <EyeIcon className="h-5 w-5 mr-2 text-[#FF6B00]" />
              <h3 className="text-lg font-semibold text-white">
                Detalhes da mensagem
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-gray-400"
              onClick={() => setShowMessageDetails(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4">
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <h4 className="text-white font-medium">{message.sender}</h4>
                  <Button
                    variant="link"
                    className="text-xs text-[#FF6B00] p-0 h-auto ml-2"
                  >
                    Ver perfil
                  </Button>
                </div>
                <p className="text-sm text-gray-400">Membro</p>
              </div>
            </div>

            <div className="bg-[#1a2236] rounded-lg p-3 mb-4">
              <p className="text-white text-sm">{message.content}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Enviado em</p>
                <p className="text-sm text-white">{message.timestamp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-[#FF6B00] mr-2"></div>
                  <p className="text-sm text-white">Entregue</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Editado</p>
                <p className="text-sm text-white">Não</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Fixado</p>
                <p className="text-sm text-white">
                  {message.isPinned ? "Sim" : "Não"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Resumo IA</p>
              <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  {message.content.includes("exercício")
                    ? "Dúvida sobre exercício e proposta para discussão em reunião."
                    : message.content.includes("artigo")
                      ? "Compartilhamento de material de estudo para ajudar com exercícios."
                      : "Mensagem sobre organização de estudo em grupo."}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Votos</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-green-500 border-green-500/20 bg-green-500/10"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />{" "}
                  {message.votes?.up.length || 0}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-red-500 border-red-500/20 bg-red-500/10"
                >
                  <ThumbsUp className="h-4 w-4 mr-1 transform rotate-180" />{" "}
                  {message.votes?.down.length || 0}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter((message) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      message.content.toLowerCase().includes(searchLower) ||
      message.sender.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-[#1a2236] rounded-lg overflow-hidden h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#FF6B00] text-white flex items-center p-3 flex-shrink-0">
        <div className="flex items-center flex-1">
          <MessageCircle className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-bold">{groupName}</h3>
          <Badge className="bg-green-500/20 text-white ml-2 rounded-full px-2">
            3 online
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-white text-xs hover:bg-white/20 rounded-full px-2"
          >
            Ver membros <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
            onClick={() => {
              const searchInput = prompt("Digite o termo de busca:");
              if (searchInput !== null) {
                setSearchQuery(searchInput);
              }
            }}
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
          >
            <Phone className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
          >
            <VideoIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
          >
            <Maximize className="h-4 w-4" />
          </Button>

          <Popover open={showGroupMenu} onOpenChange={setShowGroupMenu}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 bg-[#1e293b] border-gray-700">
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Configurações
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Resumir conversa com IA
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                  onClick={() => {
                    setShowGroupMenu(false);
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedMessages([]);
                  }}
                >
                  <Check className="h-4 w-4" /> Selecionar mensagens
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <Pin className="h-4 w-4" /> Salvar mensagens
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <Info className="h-4 w-4" /> Informações do grupo
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Configurações do grupo
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search indicator */}
      {searchQuery && (
        <div className="bg-[#1e293b] p-2 flex items-center justify-between">
          <div className="flex items-center">
            <Search className="h-4 w-4 mr-2 text-[#FF6B00]" />
            <span className="text-sm text-white">
              Resultados para:{" "}
              <span className="font-medium">"{searchQuery}"</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full hover:bg-gray-700 text-gray-400"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Pinned Messages */}
      {pinnedMessage && (
        <div className="bg-[#1a2236] border-b border-gray-800 flex-shrink-0">
          <div className="p-2 flex items-center text-[#FF6B00]">
            <Pin className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Mensagens fixadas</span>
          </div>

          <div className="p-3 border-t border-gray-800 hover:bg-[#1e293b] transition-colors">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={pinnedMessage.senderAvatar} />
                <AvatarFallback>
                  {pinnedMessage.sender.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold text-white">
                      {pinnedMessage.sender}
                    </h5>
                    <span className="text-xs text-gray-400">
                      {pinnedMessage.timestamp}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:bg-gray-800 text-gray-400"
                    onClick={() => pinMessage(0)}
                  >
                    <Star className="h-4 w-4 text-[#FF6B00]" />
                  </Button>
                </div>

                <div className="text-sm text-white">
                  {renderMessageContent(pinnedMessage)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-6">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message) => {
              const isCurrentUser = message.sender === "Você";

              return (
                <div
                  key={message.id}
                  className={`relative group ${selectedMessages.includes(message.id) ? "bg-blue-900/30 rounded-lg" : ""}`}
                  onClick={(e) => {
                    if (isSelectionMode) {
                      e.stopPropagation();
                      toggleMessageSelection(message.id);
                    }
                  }}
                >
                  {renderMessageDetails(message)}

                  <div className={`flex ${isCurrentUser ? "justify-end" : ""}`}>
                    <div
                      className={`flex max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mt-1 mr-2 flex-shrink-0">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>
                            {message.sender.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div>
                        {!isCurrentUser && (
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium text-white">
                              {message.sender}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              {message.timestamp}
                            </span>
                          </div>
                        )}

                        <div
                          className={`relative rounded-lg p-3 ${isCurrentUser ? "bg-[#FF6B00] rounded-tr-none" : "bg-[#1e293b] rounded-tl-none"}`}
                        >
                          {renderMessageContent(message)}

                          {isCurrentUser && (
                            <div className="flex justify-end items-center gap-1 mt-1">
                              <span className="text-xs text-white/70">
                                {message.timestamp}
                              </span>
                              {message.readStatus && (
                                <span>
                                  {message.readStatus === "sent" && (
                                    <svg
                                      className="h-3 w-3 text-gray-400"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M5 12L10 17L20 7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                  {message.readStatus === "delivered" && (
                                    <svg
                                      className="h-3 w-3 text-gray-400"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M5 12L10 17L20 7M5 12L10 17L20 7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                  {message.readStatus === "read" && (
                                    <svg
                                      className="h-3 w-3 text-green-500"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M5 12L10 17L20 7M5 12L10 17L20 7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Message options on hover */}
                          <div
                            className={`absolute ${isCurrentUser ? "-left-10" : "-right-10"} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowReactions(
                                  message.id === showReactions
                                    ? null
                                    : message.id,
                                );
                              }}
                            >
                              <Smile className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyingTo(message);
                              }}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </Button>

                            <Popover
                              open={showMessageOptions === message.id}
                              onOpenChange={(open) => {
                                setShowMessageOptions(open ? message.id : null);
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Close any other open message options
                                    if (showMessageOptions !== message.id) {
                                      setShowMessageOptions(message.id);
                                    }
                                  }}
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-48 p-0 bg-[#1e293b] border-gray-700"
                                align={isCurrentUser ? "start" : "end"}
                              >
                                <div className="py-1">
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowMessageDetails(message.id);
                                      setShowMessageOptions(null);
                                    }}
                                  >
                                    <EyeIcon className="h-4 w-4" /> Inspecionar
                                    mensagem
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(
                                        message.content,
                                      );
                                      setShowMessageOptions(null);
                                    }}
                                  >
                                    <Copy className="h-4 w-4" /> Copiar mensagem
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowMessageOptions(null);
                                    }}
                                  >
                                    <Share2 className="h-4 w-4" /> Compartilhar
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      pinMessage(message.id);
                                      setShowMessageOptions(null);
                                    }}
                                  >
                                    <Pin className="h-4 w-4" /> Fixar mensagem
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      translateMessage(message.id);
                                      setShowMessageOptions(null);
                                    }}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M5 8L10 13L15 8"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M4 14H12"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M14 16L17 21L20 16"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M3 5H15"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                    </svg>{" "}
                                    Traduzir
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMessageToDelete(message);
                                      setShowDeleteModal(true);
                                      setShowMessageOptions(null);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" /> Deletar
                                  </button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Reactions popup */}
                          {showReactions === message.id && (
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#1e293b] rounded-full shadow-lg p-1 flex items-center gap-1 border border-gray-700 z-10">
                              {["👍", "❤️", "😂", "😮", "🔥", "👏"].map(
                                (emoji) => {
                                  const isSelected = message.reactions?.some(
                                    (r) =>
                                      r.type === emoji &&
                                      r.users.includes("Você"),
                                  );
                                  return (
                                    <button
                                      key={emoji}
                                      className={`text-lg hover:bg-gray-800 p-1 rounded-full transition-all ${isSelected ? "bg-gray-700" : ""}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addReaction(message.id, emoji);
                                      }}
                                    >
                                      {emoji}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          )}

                          {/* Vote buttons removed from here - moved below */}
                        </div>

                        {/* Message reactions and votes display */}
                        <div className="flex flex-col mt-1 gap-1">
                          {/* Reactions */}
                          {message.reactions &&
                            message.reactions.length > 0 && (
                              <div className="flex gap-1">
                                {message.reactions.map((reaction, i) => (
                                  <button
                                    key={i}
                                    className={`px-1.5 py-0.5 bg-[#1e293b] rounded-full border ${reaction.users.includes("Você") ? "border-[#FF6B00]/50" : "border-gray-700"} text-xs flex items-center gap-1 hover:bg-gray-800`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addReaction(message.id, reaction.type);
                                    }}
                                  >
                                    <span>{reaction.type}</span>
                                    <span className="text-gray-400">
                                      {reaction.count}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}

                          {/* Votes */}
                          {(message.votes?.up.length > 0 ||
                            message.votes?.down.length > 0 ||
                            showVotes === message.id) && (
                            <div
                              className="flex items-center gap-3 w-fit"
                              onMouseEnter={() => setShowVotes(message.id)}
                              onMouseLeave={() => setShowVotes(null)}
                            >
                              <button
                                className={`flex items-center gap-1 ${message.votes?.up.includes("Você") ? "text-green-500" : "text-gray-400 hover:text-green-500"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addVote(
                                    message.id,
                                    message.votes?.up.includes("Você")
                                      ? null
                                      : "up",
                                  );
                                }}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span className="text-xs">
                                  {message.votes?.up.length || 0}
                                </span>
                              </button>

                              <button
                                className={`flex items-center gap-1 ${message.votes?.down.includes("Você") ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addVote(
                                    message.id,
                                    message.votes?.down.includes("Você")
                                      ? null
                                      : "down",
                                  );
                                }}
                              >
                                <ThumbsUp className="h-4 w-4 transform rotate-180" />
                                <span className="text-xs">
                                  {message.votes?.down.length || 0}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhuma mensagem encontrada
              </h3>
              <p className="text-sm text-gray-400">
                Não encontramos mensagens contendo "{searchQuery}"
              </p>
              <Button
                variant="outline"
                className="mt-4 text-[#FF6B00] border-[#FF6B00]/30"
                onClick={() => setSearchQuery("")}
              >
                Limpar busca
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageCircle className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhuma mensagem ainda
              </h3>
              <p className="text-sm text-gray-400">
                Seja o primeiro a enviar uma mensagem neste grupo!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-800 flex-shrink-0">
        {replyingTo && (
          <div className="bg-[#1e293b] p-2 rounded-lg mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2 text-[#FF6B00]" />
              <span className="text-sm text-gray-400">
                Respondendo para{" "}
                <span className="text-white font-medium">
                  {replyingTo.sender}
                </span>
                : {replyingTo.content.substring(0, 50)}
                {replyingTo.content.length > 50 ? "..." : ""}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full hover:bg-gray-700 text-gray-400"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isRecording ? (
          <div className="bg-[#1e293b] p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse mr-3"></div>
              <span className="text-white font-medium">
                Gravando: {formatTime(recordingTime)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-gray-400"
                onClick={cancelRecording}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="h-8 bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                onClick={stopRecording}
              >
                Enviar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <textarea
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg pl-3 pr-10 py-2 text-white resize-none min-h-[40px] max-h-[120px] overflow-auto"
                placeholder="Digite sua mensagem..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{
                  height: "40px",
                  maxHeight: "120px",
                }}
              />

              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Popover
                  open={showEmojiPicker}
                  onOpenChange={setShowEmojiPicker}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-gray-400"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-64 p-0 bg-[#1e293b] border-gray-700"
                    align="end"
                  >
                    <div className="p-2 grid grid-cols-8 gap-1">
                      {[
                        "😀",
                        "😂",
                        "😊",
                        "😍",
                        "😎",
                        "😢",
                        "😡",
                        "👍",
                        "👎",
                        "❤️",
                        "🔥",
                        "🎉",
                        "🤔",
                        "👏",
                        "🙏",
                        "🤝",
                      ].map((emoji) => (
                        <button
                          key={emoji}
                          className="text-xl hover:bg-gray-800 p-1 rounded-lg transition-all"
                          onClick={() => {
                            setMessageText(messageText + emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover
                  open={showAttachmentOptions}
                  onOpenChange={setShowAttachmentOptions}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-gray-400"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-48 p-0 bg-[#1e293b] border-gray-700"
                    align="end"
                  >
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#FF6B00]" />
                        Arquivo
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2"
                        >
                          <path
                            d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                            stroke="#FF6B00"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7 10L12 15L17 10"
                            stroke="#FF6B00"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15V3"
                            stroke="#FF6B00"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Imagem
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2"
                        >
                          <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            stroke="#FF6B00"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 8L16 12L10 16V8Z"
                            stroke="#FF6B00"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Vídeo
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 rounded-full hover:bg-gray-700 text-gray-400"
              onClick={startRecording}
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              size="sm"
              className="h-10 w-10 p-0 rounded-full bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Delete Message Modal */}
      {showDeleteModal && messageToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1e293b] w-full max-w-md rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Deletar mensagem
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-gray-400"
                onClick={() => {
                  setShowDeleteModal(false);
                  setMessageToDelete(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              <p className="text-gray-300 mb-4">
                Escolha como você deseja deletar esta mensagem
              </p>

              <div className="space-y-3">
                <button
                  className="w-full text-left p-3 border border-gray-700 rounded-lg flex items-center gap-3 hover:bg-gray-800"
                  onClick={() => handleDeleteMessage(messageToDelete, false)}
                >
                  <div className="bg-[#FF6B00]/20 p-2 rounded-full">
                    <Trash2 className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Deletar para mim</p>
                    <p className="text-sm text-gray-400">
                      A mensagem será removida apenas para você
                    </p>
                  </div>
                </button>

                {messageToDelete.sender === "Você" && (
                  <button
                    className="w-full text-left p-3 border border-red-900/30 rounded-lg flex items-center gap-3 hover:bg-red-900/20"
                    onClick={() => handleDeleteMessage(messageToDelete, true)}
                  >
                    <div className="bg-red-900/30 p-2 rounded-full">
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-red-500">
                        Deletar para todos
                      </p>
                      <p className="text-sm text-gray-400">
                        A mensagem será removida para todos os participantes
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end">
              <Button
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
                onClick={() => {
                  setShowDeleteModal(false);
                  setMessageToDelete(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Mode Indicator */}
      {isSelectionMode && selectedMessages.length > 0 && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#1e293b] rounded-lg shadow-lg p-3 flex items-center gap-3 z-50">
          <span className="text-white">
            {selectedMessages.length} mensagens selecionadas
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-white"
            onClick={() => {
              setIsSelectionMode(false);
              setSelectedMessages([]);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
