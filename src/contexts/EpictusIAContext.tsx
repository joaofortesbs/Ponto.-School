
import React, { createContext, useContext, useState, ReactNode } from "react";

interface EpictusIAContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  showMiniChat: boolean;
  setShowMiniChat: (show: boolean) => void;
}

const EpictusIAContext = createContext<EpictusIAContextType | undefined>(undefined);

export function EpictusIAProvider({ children }: { children: ReactNode }) {
  // Obter o parâmetro de URL 'tab' se existir
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || "conversation");
  const [inputMessage, setInputMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showMiniChat, setShowMiniChat] = useState(false);

  // Atualizar a URL quando a aba mudar
  const updateActiveTab = (tab: string) => {
    setActiveTab(tab);
    
    // Verificar se tab é chat-epictus ou conversation para definir showChat
    if (tab === 'chat-epictus' || tab === 'conversation') {
      setShowChat(true);
    } else {
      setShowChat(false);
    }

    // Atualizar a URL sem recarregar a página
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  return (
    <EpictusIAContext.Provider
      value={{
        activeTab,
        setActiveTab: updateActiveTab,
        inputMessage,
        setInputMessage,
        showChat,
        setShowChat,
        showMiniChat,
        setShowMiniChat,
      }}
    >
      {children}
    </EpictusIAContext.Provider>
  );
}

export function useEpictusIA() {
  const context = useContext(EpictusIAContext);
  if (context === undefined) {
    throw new Error("useEpictusIA must be used within an EpictusIAProvider");
  }
  return context;
}
