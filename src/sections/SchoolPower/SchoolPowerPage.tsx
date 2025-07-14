"use client";
import React, { useState } from "react";
import {
  TopHeader,
  ProfileSelector,
  ChatInput,
  Particles3D,
  SideMenu,
  ParticlesBackground,
} from "./components";

export function SchoolPowerPage() {
  const [isDarkTheme] = useState(true);
  const [isCentralExpanded, setIsCentralExpanded] = useState(false);

  const handleCentralExpandedChange = (expanded: boolean) => {
    setIsCentralExpanded(expanded);
  };

  return (
    <div
      className="relative flex h-[90vh] min-h-[650px] w-full flex-col items-center justify-center overflow-hidden rounded-lg"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Background de estrelas */}
      <ParticlesBackground isDarkTheme={isDarkTheme} />

      {/* Vertical dock positioned at right side */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
        <SideMenu />
      </div>

      {/* Container Ripple fixo e centralizado no background */}
      <div className="absolute top-[57%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="relative" style={{ width: "900px", height: "617px" }}>
          {/* TechCircle posicionado no topo do container Ripple */}
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-30 pointer-events-none"
            style={{ marginTop: "7px" }}
          >
            <TopHeader isDarkTheme={isDarkTheme} />
          </div>

          {/* Ripple centralizado */}
          <div className="absolute inset-0">
            <Particles3D isDarkTheme={isDarkTheme} isBlurred={isCentralExpanded} />
          </div>

          {/* Ícone Central no centro do Ripple */}
          <div
            className="absolute z-50 pointer-events-auto"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <ProfileSelector
              isDarkTheme={isDarkTheme}
              onExpandedChange={handleCentralExpandedChange}
            />
          </div>

          {/* Caixa de Mensagem dentro do mesmo container Ripple */}
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 translate-y-full z-40 pointer-events-auto" style={{ marginTop: "-150px" }}>
            <ChatInput isDarkTheme={isDarkTheme} />
          </div>
        </div>
      </div>
    </div>
  );
}