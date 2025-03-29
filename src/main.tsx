import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LogoPreloader } from "@/components/LogoPreloader";
import { LogoManager } from "@/components/LogoManager";
import {
  DEFAULT_LOGO,
  getVersionedLogoUrl,
  saveLogoToLocalStorage,
  getLogoVersion,
  preloadLogo,
  initLogoConfig,
} from "@/lib/logo-utils";

import { TempoDevtools } from "tempo-devtools";

TempoDevtools.init();

// Initialize logo configuration
initLogoConfig();

// Sistema avançado de preload da logo com redundância
const currentVersion = getLogoVersion();
const logoUrl = window.PONTO_SCHOOL_CONFIG?.defaultLogo || DEFAULT_LOGO;
const versionedLogoUrl = getVersionedLogoUrl(logoUrl, currentVersion);

// Preload the logo with versioning
preloadLogo(
  logoUrl,
  currentVersion,
  (versionedUrl) => {
    console.log("Global logo preloaded successfully in main.tsx");
    // Logo loaded successfully, already saved to localStorage in preloadLogo
  },
  () => {
    console.error("Failed to preload global logo in main.tsx");
    // Retry with incremented version
    setTimeout(() => {
      preloadLogo(
        logoUrl,
        currentVersion + 1,
        (retryUrl) => {
          console.log("Global logo preloaded successfully after retry");
        },
        () => {
          console.error("Failed to preload logo after retry");
          document.dispatchEvent(new CustomEvent("logoLoadFailed"));
        },
      );
    }, 1000);
  },
);

// Verificar se a logo já foi carregada por outro script
const checkExistingLogo = () => {
  try {
    const logoPreloaded = localStorage.getItem("logoPreloaded");
    const customLogo = localStorage.getItem("customLogo");
    const pontoSchoolLogo = localStorage.getItem("pontoSchoolLogo");
    const storedVersion = getLogoVersion();

    if (
      (logoPreloaded === "true" &&
        customLogo &&
        customLogo !== "null" &&
        customLogo !== "undefined") ||
      (pontoSchoolLogo &&
        pontoSchoolLogo !== "null" &&
        pontoSchoolLogo !== "undefined")
    ) {
      console.log("Logo already preloaded by another component in main.tsx");
      const logoToUse = pontoSchoolLogo || customLogo;
      const versionedLogo = getVersionedLogoUrl(logoToUse, storedVersion);

      window.PONTO_SCHOOL_CONFIG = {
        defaultLogo: versionedLogo,
        logoLoaded: true,
        logoVersion: storedVersion,
      };
      return true;
    }
    return false;
  } catch (e) {
    console.warn("Error checking localStorage for logo in main.tsx", e);
    return false;
  }
};

// Se a logo ainda não foi carregada, verificar novamente quando o DOM estiver pronto
if (!checkExistingLogo()) {
  document.addEventListener("DOMContentLoaded", checkExistingLogo);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LogoManager />
        <LogoPreloader />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
