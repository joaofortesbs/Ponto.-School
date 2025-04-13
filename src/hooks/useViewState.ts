
import { useState, useEffect } from "react";

interface ViewStateOptions {
  defaultView?: "grid" | "list";
  storageKey?: string;
  onChange?: (view: "grid" | "list") => void;
}

/**
 * Hook para gerenciar estado de visualização (grade ou lista)
 */
export function useViewState({
  defaultView = "grid",
  storageKey = "view_preference",
  onChange,
}: ViewStateOptions = {}) {
  // Tenta recuperar a preferência do localStorage
  const getSavedView = (): "grid" | "list" => {
    if (typeof window === "undefined") return defaultView;
    const saved = localStorage.getItem(storageKey);
    return (saved === "grid" || saved === "list") ? saved : defaultView;
  };

  const [view, setView] = useState<"grid" | "list">(defaultView);
  
  // Carrega preferência do usuário no carregamento inicial
  useEffect(() => {
    setView(getSavedView());
  }, []);

  // Salva mudanças no localStorage
  const toggleView = () => {
    const newView = view === "grid" ? "list" : "grid";
    setView(newView);
    
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, newView);
    }
    
    if (onChange) {
      onChange(newView);
    }
  };

  return { view, toggleView };
}
