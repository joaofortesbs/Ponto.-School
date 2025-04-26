import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import EpictusIAInterface from "@/components/epictus-ia/EpictusIAComplete";
import EpictusBetaMode from "@/components/epictus-ia/EpictusBetaMode";
import ErrorBoundary from "@/components/epictus-ia/ErrorHandler";

export default function EpictusIAPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    // Get the mode from URL parameters
    const urlMode = searchParams.get("mode");
    setMode(urlMode);

    // Listen for the custom event that might be triggered by other components
    const handleModeChange = (event: CustomEvent) => {
      setMode(event.detail.mode);
    };

    window.addEventListener("activateBetaMode", handleModeChange as EventListener);

    return () => {
      window.removeEventListener("activateBetaMode", handleModeChange as EventListener);
    };
  }, [searchParams]);

  console.log("Renderizando página Epictus IA, modo:", mode);

  return (
    <ErrorBoundary componentName="EpictusIAPage">
      <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
        {mode === "beta" ? <EpictusBetaMode /> : <EpictusIAInterface />}
      </Suspense>
    </ErrorBoundary>
  );
}