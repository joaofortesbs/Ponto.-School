
import { useState } from "react";
import { defaultData } from "../data/defaultData";

export const useFloatingChatSupport = () => {
  const [tickets, setTickets] = useState(defaultData.tickets);
  const [faqs, setFaqs] = useState(defaultData.faqs);
  const [suggestions, setSuggestions] = useState(defaultData.suggestions);
  const [chatHistory, setChatHistory] = useState(defaultData.chatHistory);
  const [notifications, setNotifications] = useState(defaultData.notifications);
  
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

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return;

    const ticket = {
      id: (tickets.length + 1).toString(),
      title: newTicket.title,
      description: newTicket.description,
      status: "open" as const,
      category: newTicket.category,
      createdAt: new Date(),
    };

    setTickets((prev) => [ticket, ...prev]);
    setNewTicket({
      title: "",
      description: "",
      category: "Acesso e Conteúdo",
    });
    setIsCreatingTicket(false);
  };

  const handleCreateSuggestion = () => {
    if (!newSuggestion.title || !newSuggestion.description) return;

    const suggestion = {
      id: (suggestions.length + 1).toString(),
      title: newSuggestion.title,
      description: newSuggestion.description,
      votes: 1,
      status: "pending" as const,
      createdAt: new Date(),
      userVoted: true,
    };

    setSuggestions((prev) => [suggestion, ...prev]);
    setNewSuggestion({
      title: "",
      description: "",
    });
    setIsCreatingSuggestion(false);
  };

  const handleVote = (id: string) => {
    setSuggestions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              votes: item.userVoted ? item.votes - 1 : item.votes + 1,
              userVoted: !item.userVoted,
            }
          : item,
      ),
    );
  };

  return {
    tickets,
    setTickets,
    faqs,
    setFaqs,
    suggestions,
    setSuggestions,
    chatHistory,
    setChatHistory,
    notifications,
    setNotifications,
    handleCreateTicket,
    handleCreateSuggestion,
    handleVote,
    isCreatingTicket,
    setIsCreatingTicket,
    isCreatingSuggestion,
    setIsCreatingSuggestion,
    newTicket,
    setNewTicket,
    newSuggestion,
    setNewSuggestion
  };
};
