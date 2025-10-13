
"use client";
import React from "react";
import { BookOpen, Zap, Brain, GraduationCap } from 'lucide-react';

interface QuickAccessCardsProps {
  selectedCard: string | null;
  onCardClick: (cardName: string) => void;
}

export const QuickAccessCards: React.FC<QuickAccessCardsProps> = ({ selectedCard, onCardClick }) => {
  const handleClick = (cardName: string) => {
    console.log('📝 Card clicado:', cardName);
    onCardClick(cardName);
  };

  return (
    <div className="quick-access-cards">
      <div 
        className={`quick-access-card ${selectedCard === "Plano ENEM" ? "selected" : ""}`} 
        onClick={() => handleClick("Plano ENEM")}
      >
        <BookOpen className="quick-access-card-icon" />
        <span className="quick-access-card-text">Plano ENEM</span>
      </div>
      <div 
        className={`quick-access-card ${selectedCard === "Aula Turbo" ? "selected" : ""}`} 
        onClick={() => handleClick("Aula Turbo")}
      >
        <Zap className="quick-access-card-icon" />
        <span className="quick-access-card-text">Aula Turbo</span>
      </div>
      <div 
        className={`quick-access-card ${selectedCard === "Criando Gênios" ? "selected" : ""}`} 
        onClick={() => handleClick("Criando Gênios")}
      >
        <Brain className="quick-access-card-icon" />
        <span className="quick-access-card-text">Criando Gênios</span>
      </div>
      <div 
        className={`quick-access-card ${selectedCard === "Escola Viva" ? "selected" : ""}`} 
        onClick={() => handleClick("Escola Viva")}
      >
        <GraduationCap className="quick-access-card-icon" />
        <span className="quick-access-card-text">Escola Viva</span>
      </div>
    </div>
  );
};
