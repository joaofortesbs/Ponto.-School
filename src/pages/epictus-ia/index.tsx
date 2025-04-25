
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EpictusIAInterface from "@/components/epictus-ia/EpictusIAComplete";
import EpictusBetaMode from "@/components/epictus-ia/EpictusBetaMode";

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
  
  // Render the appropriate interface based on the mode
  return (
    <div className="w-full h-full">
      {mode === "beta" ? <EpictusBetaMode /> : <EpictusIAInterface />}
    </div>
  );
}
