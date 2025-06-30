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
  Minimize,
  Star,
  Eye as EyeIcon,
  Copy,
  Share2,
  Settings,
  Info,
  Check,
  Download,
  Image,
  Film,
  ArrowLeft,
  BookOpen,
  Calendar,
} from "lucide-react";

interface DiscussoesTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  groupName?: string;
  group?: any; // Add group prop
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
  videoUrl?: string;
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
  isOneTimeView?: boolean;
  hasBeenViewed?: boolean;
  replyTo?: {
    id: number;
    sender: string;
    content: string;
  };
  readStatus?: "sent" | "delivered" | "read";
  sentAt?: Date;
}

export const DiscussoesTab: React.FC<DiscussoesTabProps> = ({
  searchQuery,
  setSearchQuery,
  groupName = "Mecânica Quântica Avançada",
  group,
}) => {
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isOneTimeView, setIsOneTimeView] = useState(false);
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
  const [showExpandedChat, setShowExpandedChat] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState("");

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Default cover image if none is provided
  const defaultCoverImage =
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&q=90";

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
      sentAt: new Date(new Date().getTime() - 15 * 60000), // 15 minutes ago
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
      sentAt: new Date(new Date().getTime() - 12 * 60000), // 12 minutes ago
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
      sentAt: new Date(new Date().getTime() - 10 * 60000), // 10 minutes ago
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
      sentAt: new Date(new Date().getTime() - 10 * 60000), // 10 minutes ago
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
      sentAt: new Date(new Date().getTime() - 5 * 60000), // 5 minutes ago
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

    if (editingMessage) {
      // Handle editing existing message
      setMessages(
        messages.map((msg) => {
          if (msg.id === editingMessage.id) {
            return {
              ...msg,
              content: messageText,
              isEdited: true,
            };
          }
          return msg;
        }),
      );
      setEditingMessage(null);
      setMessageText("");
      return;
    }

    const newMessage: Message = {
      id: messages.length + 1,
      content: messageText,
      sender: "Você", // Current user
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Voce",
      timestamp: "Agora",
      type: "text",
      readStatus: "sent",
      votes: { up: [], down: [] },
      sentAt: new Date(),
      isOneTimeView: isOneTimeView,
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
    setIsOneTimeView(false);

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
            {message.isOneTimeView && (
              <span className="ml-2 inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                <EyeIcon className="h-3 w-3 mr-1" /> Visualização única
              </span>
            )}
          </p>
        );

      case "file":
        if (!message.fileInfo) return null;

        return (
          <div className="mt-1">
            <div className="flex items-center p-2 rounded-lg bg-gray-800/30 dark:bg-gray-900/50">
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

      case "image":
        return (
          <div className="mt-1 relative group">
            <img
              src={message.imageUrl}
              alt="Imagem compartilhada"
              className="rounded-lg max-h-[200px] object-cover w-auto border border-gray-700/50"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="mt-1">
            <div className="rounded-lg overflow-hidden border border-gray-700/50">
              <video
                controls
                className="max-h-[200px] w-full"
                src={message.videoUrl}
              />
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="mt-1">
            <div className="flex items-center p-2 rounded-lg bg-gray-800/30 dark:bg-gray-900/50">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 mr-2 rounded-full bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF6B00]"
                onClick={() => {
                  // In a real implementation, this would play the audio
                  const audio = new Audio(message.audioUrl || "");
                  audio.play();
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                </svg>
              </Button>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="bg-[#FF6B00] h-full w-0 hover:w-full transition-all duration-300"></div>
              </div>
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
        <div className="bg-[#1e293b] dark:bg-gray-900 w-full max-w-md rounded-lg shadow-lg overflow-hidden animate-slideInUp">
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

            <div className="bg-[#1a2236] dark:bg-gray-800 rounded-lg p-3 mb-4">
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
              <div className="bg-blue-900/20 dark:bg-blue-900/30 border border-blue-900/30 rounded-lg p-3">
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
      message.sender.toLowerCase().includes(searchLower) ||
      (message.fileInfo?.name &&
        message.fileInfo.name.toLowerCase().includes(searchLower)) ||
      (message.replyTo?.content &&
        message.replyTo.content.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Chat Interface */}
      <div
        className={`bg-[#1a2236] dark:bg-gray-900 rounded-lg overflow-hidden flex-grow flex flex-col ${showExpandedChat ? "fixed inset-0 z-50 flex items-center justify-center" : ""}`}
      >
        {showExpandedChat && (
          <div
            className="absolute inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowExpandedChat(false)}
          ></div>
        )}
        <div
          className={`relative ${showExpandedChat ? "w-[90%] max-w-4xl h-[90%] max-h-[800px] rounded-xl shadow-2xl animate-slideInUp" : "w-full h-full"}`}
        >
          {/* Chat Header */}
          <div className="bg-[#FF6B00] dark:bg-[#FF8C40] text-white flex items-center p-3 flex-shrink-0">
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
                onClick={() => setShowExpandedChat(!showExpandedChat)}
              >
                {showExpandedChat ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
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
                <PopoverContent className="w-56 p-0 bg-[#1e293b] dark:bg-gray-800 border-gray-700 dark:border-gray-600">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Configurações
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> Resumir conversa com
                      IA
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
            <div className="bg-[#1e293b] dark:bg-gray-800 p-2 flex items-center justify-between">
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
            <div className="bg-[#1a2236] dark:bg-gray-900 border-b border-gray-800 flex-shrink-0">
              <div className="p-2 flex items-center text-[#FF6B00]">
                <Pin className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Mensagens fixadas</span>
              </div>

              <div className="p-3 border-t border-gray-800 hover:bg-[#1e293b] dark:hover:bg-gray-800 transition-colors">
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
          <ScrollArea className="flex-grow custom-scrollbar">
            <div className="p-4 space-y-6">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => {
                  const isCurrentUser = message.sender === "Você";

                  return (
                    <div
                      key={message.id}
                      className={`relative group ${selectedMessages.includes(message.id) ? "bg-blue-900/30 dark:bg-blue-900/50 rounded-lg p-2" : ""}`}
                      onClick={(e) => {
                        if (isSelectionMode) {
                          e.stopPropagation();
                          toggleMessageSelection(message.id);
                        }
                      }}
                    >
                      {/* Selection checkbox for selection mode */}
                      {isSelectionMode && (
                        <div
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMessageSelection(message.id);
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${selectedMessages.includes(message.id) ? "bg-[#FF6B00] border-[#FF6B00]" : "border-2 border-gray-600 bg-gray-800/50"}`}
                          >
                            {selectedMessages.includes(message.id) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                      )}

                      {renderMessageDetails(message)}

                      <div
                        className={`flex ${isCurrentUser ? "justify-end" : ""}`}
                      >
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
                              className={`relative rounded-lg p-3 ${isCurrentUser ? "bg-[#FF6B00] dark:bg-[#FF8C40] rounded-tr-none" : "bg-[#1e293b] dark:bg-gray-800 rounded-tl-none"}`}
                            >
                              {/* Reply to message indicator */}
                              {message.replyTo && (
                                <div className="mb-2 p-2 rounded bg-gray-800/50 dark:bg-gray-700/50 border-l-2 border-[#FF6B00] text-sm">
                                  <div className="flex items-center gap-1 text-gray-400 mb-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span>
                                      Resposta para {message.replyTo.sender}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 truncate">
                                    {message.replyTo.content}
                                  </p>
                                </div>
                              )}

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
                                    setShowMessageOptions(
                                      open ? message.id : null,
                                    );
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
                                    className="w-48 p-0 bg-[#1e293b] dark:bg-gray-800 border-gray-700 dark:border-gray-600"
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
                                        <EyeIcon className="h-4 w-4" />{" "}
                                        Inspecionar mensagem
                                      </button>
                                      {message.sender === "Você" &&
                                        message.sentAt &&
                                        new Date().getTime() -
                                          message.sentAt.getTime() <
                                          10 * 60 * 1000 && (
                                          <button
                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingMessage(message);
                                              setMessageText(message.content);
                                              setShowMessageOptions(null);
                                            }}
                                          >
                                            <svg
                                              width="16"
                                              height="16"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4"
                                            >
                                              <path
                                                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                              <path
                                                d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>{" "}
                                            Editar
                                          </button>
                                        )}
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
                                        <Copy className="h-4 w-4" /> Copiar
                                        mensagem
                                      </button>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowMessageOptions(null);
                                        }}
                                      >
                                        <Share2 className="h-4 w-4" />{" "}
                                        Compartilhar
                                      </button>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          pinMessage(message.id);
                                          setShowMessageOptions(null);
                                        }}
                                      >
                                        <Pin className="h-4 w-4" /> Fixar
                                        mensagem
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
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#1e293b] dark:bg-gray-800 rounded-full shadow-lg p-1 flex items-center gap-1 border border-gray-700 dark:border-gray-600 z-10">
                                  {["👍", "❤️", "😂", "😮", "🔥", "👏"].map(
                                    (emoji) => {
                                      const isSelected =
                                        message.reactions?.some(
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
                            </div>

                            {/* Message reactions and votes display */}
                            <div className="flex flex-col mt-1 gap-1">
                              {/* Combined reactions and votes */}
                              <div className="flex items-center gap-2">
                                {/* Reactions */}
                                {message.reactions &&
                                  message.reactions.length > 0 && (
                                    <div className="flex gap-1">
                                      {message.reactions.map((reaction, i) => (
                                        <button
                                          key={i}
                                          className={`px-1.5 py-0.5 bg-[#1e293b] dark:bg-gray-800 rounded-full border ${reaction.users.includes("Você") ? "border-[#FF6B00]/50" : "border-gray-700 dark:border-gray-600"} text-xs flex items-center gap-1 hover:bg-gray-800`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addReaction(
                                              message.id,
                                              reaction.type,
                                            );
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

                                {/* Votes - Only shown on hover */}
                                <div className="flex items-center gap-3 w-fit transition-opacity duration-200 opacity-0 group-hover:opacity-100">
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
                              </div>
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
          <div className="p-3 border-t border-gray-800 dark:border-gray-700 flex-shrink-0">
            {replyingTo && (
              <div className="bg-[#1e293b] dark:bg-gray-800 p-2 rounded-lg mb-2 flex items-center justify-between">
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
              <div className="bg-[#1e293b] dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between">
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
                    className="w-full bg-[#1e293b] dark:bg-gray-800 border border-gray-700 dark:border-gray-600 rounded-lg pl-3 pr-10 py-2 text-white resize-none min-h-[40px] max-h-[120px] overflow-auto"
                    placeholder={
                      editingMessage
                        ? "Editando mensagem..."
                        : "Digite sua mensagem..."
                    }
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{
                      height: "40px",
                      maxHeight: "120px",
                    }}
                  />

                  {editingMessage && (
                    <div className="absolute left-0 -top-8 bg-[#1e293b] dark:bg-gray-800 text-xs text-[#FF6B00] p-1 px-2 rounded-t-md border-t border-l border-r border-gray-700 dark:border-gray-600">
                      Editando mensagem
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-gray-700 text-gray-400"
                        onClick={() => {
                          setEditingMessage(null);
                          setMessageText("");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {isOneTimeView && (
                      <div className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs flex items-center">
                        <EyeIcon className="h-3 w-3 mr-1" /> Visualização única
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-blue-500/30 text-blue-300"
                          onClick={() => setIsOneTimeView(false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
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
                        className="w-64 p-0 bg-[#1e293b] dark:bg-gray-800 border-gray-700 dark:border-gray-600"
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
                        className="w-56 p-0 bg-[#1e293b] dark:bg-gray-800 border-gray-700 dark:border-gray-600"
                        align="end"
                      >
                        <div className="py-1">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                            onClick={() => {
                              // In a real implementation, this would open a file picker
                              const mockFileMessage: Message = {
                                id: messages.length + 1,
                                content: "Arquivo compartilhado",
                                sender: "Você",
                                senderAvatar:
                                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Voce",
                                timestamp: "Agora",
                                type: "file",
                                fileInfo: {
                                  name: "documento_importante.pdf",
                                  size: "2.4 MB",
                                  type: "pdf",
                                },
                                readStatus: "sent",
                                votes: { up: [], down: [] },
                                sentAt: new Date(),
                              };
                              setMessages([...messages, mockFileMessage]);
                              setShowAttachmentOptions(false);
                            }}
                          >
                            <FileText className="h-4 w-4 text-[#FF6B00]" />
                            Arquivo
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                            onClick={() => {
                              // In a real implementation, this would open an image picker
                              const mockImageMessage: Message = {
                                id: messages.length + 1,
                                content: "Imagem compartilhada",
                                sender: "Você",
                                senderAvatar:
                                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Voce",
                                timestamp: "Agora",
                                type: "image",
                                imageUrl:
                                  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
                                readStatus: "sent",
                                votes: { up: [], down: [] },
                                sentAt: new Date(),
                              };
                              setMessages([...messages, mockImageMessage]);
                              setShowAttachmentOptions(false);
                            }}
                          >
                            <Image className="h-4 w-4 text-[#FF6B00]" />
                            Imagem
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                            onClick={() => {
                              // In a real implementation, this would open a video picker
                              const mockVideoMessage: Message = {
                                id: messages.length + 1,
                                content: "Vídeo compartilhado",
                                sender: "Você",
                                senderAvatar:
                                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Voce",
                                timestamp: "Agora",
                                type: "video",
                                videoUrl:
                                  "https://www.w3schools.com/html/mov_bbb.mp4",
                                readStatus: "sent",
                                votes: { up: [], down: [] },
                                sentAt: new Date(),
                              };
                              setMessages([...messages, mockVideoMessage]);
                              setShowAttachmentOptions(false);
                            }}
                          >
                            <Film className="h-4 w-4 text-[#FF6B00]" />
                            Vídeo
                          </button>
                          <div className="border-t border-gray-700 dark:border-gray-600 my-1"></div>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-gray-800 flex items-center gap-2"
                            onClick={() => {
                              setIsOneTimeView(!isOneTimeView);
                              setShowAttachmentOptions(false);
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                            Visualização única {isOneTimeView && "✓"}
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
                  {editingMessage ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Delete Message Modal */}
          {showDeleteModal && messageToDelete && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
              <div className="bg-[#1e293b] dark:bg-gray-900 w-full max-w-md rounded-lg shadow-lg overflow-hidden animate-slideInUp">
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
                      onClick={() =>
                        handleDeleteMessage(messageToDelete, false)
                      }
                    >
                      <div className="bg-[#FF6B00]/20 p-2 rounded-full">
                        <Trash2 className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          Deletar para mim
                        </p>
                        <p className="text-sm text-gray-400">
                          A mensagem será removida apenas para você
                        </p>
                      </div>
                    </button>

                    {messageToDelete.sender === "Você" && (
                      <button
                        className="w-full text-left p-3 border border-red-900/30 rounded-lg flex items-center gap-3 hover:bg-red-900/20"
                        onClick={() =>
                          handleDeleteMessage(messageToDelete, true)
                        }
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
          {isSelectionMode && (
            <div className="absolute top-[56px] left-0 right-0 bg-[#1e293b] dark:bg-gray-800 shadow-lg p-3 flex items-center justify-between z-40 animate-slideInUp">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">
                  {selectedMessages.length} mensagens selecionadas
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedMessages.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-gray-700 text-white hover:bg-gray-700"
                      onClick={() => {
                        // Pin all selected messages
                        setMessages(
                          messages.map((msg) => {
                            if (selectedMessages.includes(msg.id)) {
                              return { ...msg, isPinned: true };
                            }
                            return msg;
                          }),
                        );
                      }}
                    >
                      <Pin className="h-4 w-4 mr-2" /> Fixar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-gray-700 text-white hover:bg-gray-700"
                      onClick={() => {
                        if (selectedMessages.length === 1) {
                          const messageToReply = messages.find(
                            (m) => m.id === selectedMessages[0],
                          );
                          if (messageToReply) {
                            setReplyingTo(messageToReply);
                            setIsSelectionMode(false);
                            setSelectedMessages([]);
                          }
                        }
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" /> Responder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-gray-700 text-white hover:bg-gray-700"
                      onClick={() => {
                        if (selectedMessages.length === 1) {
                          const messageToCopy = messages.find(
                            (m) => m.id === selectedMessages[0],
                          );
                          if (messageToCopy) {
                            navigator.clipboard.writeText(
                              messageToCopy.content,
                            );
                          }
                        } else if (selectedMessages.length > 1) {
                          const selectedContents = messages
                            .filter((m) => selectedMessages.includes(m.id))
                            .map((m) => `${m.sender}: ${m.content}`)
                            .join("\n");
                          navigator.clipboard.writeText(selectedContents);
                        }
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-red-900/30 text-red-500 hover:bg-red-900/20"
                      onClick={() => {
                        if (selectedMessages.length === 1) {
                          const messageToDelete = messages.find(
                            (m) => m.id === selectedMessages[0],
                          );
                          if (messageToDelete) {
                            setMessageToDelete(messageToDelete);
                            setShowDeleteModal(true);
                          }
                        } else {
                          // Handle bulk delete
                          setMessages(
                            messages.filter(
                              (msg) => !selectedMessages.includes(msg.id),
                            ),
                          );
                          setSelectedMessages([]);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Deletar
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-white ml-2"
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedMessages([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussoesTab;
