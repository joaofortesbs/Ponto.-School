
"use client";
import React from "react";
import { BookOpen, Zap, Brain, GraduationCap } from 'lucide-react';

interface QuickAccessCardsProps {
  selectedCard: string | null;
  onCardClick: (cardName: string) => void;
}

export const QuickAccessCards: React.FC<QuickAccessCardsProps> = ({ selectedCard, onCardClick }) => {
  return (
    <div className="quick-access-cards">
      <div 
        className={`quick-access-card ${selectedCard === "Plano ENEM" ? "selected" : ""}`} 
        onClick={() => onCardClick("Plano ENEM")}
      >
        <BookOpen className="quick-access-card-icon" />
        <span className="quick-access-card-text">Plano ENEM</span>
      </div>
      <div 
        className={`quick-access-card ${selectedCard === "Aula Turbo" ? "selected" : ""}`} 
        onClick={() => onCardClick("Aula Turbo")}
      >
        <Zap className="quick-access-card-icon" />
        <span className="quick-access-card-text">Aula Turbo</span>
      </div>
      <div 
        className={`quick-access-card ${selectedCard === "Criando Gênios" ? "selected" : ""}`} 
        onClick={() => onCardClick("Criando Gênios")}
      >
        <Brain className="quick-access-card-icon" />
        <span className="quick-access-card-text">Criando Gênios</span>
      </div>
      <div 
        className={`quick-access-card ${selectedCard === "Escola Viva" ? "selected" : ""}`} 
        onClick={() => onCardClick("Escola Viva")}
      >
        <GraduationCap className="quick-access-card-icon" />
        <span className="quick-access-card-text">Escola Viva</span>
      </div>
    </div>
  );
};
