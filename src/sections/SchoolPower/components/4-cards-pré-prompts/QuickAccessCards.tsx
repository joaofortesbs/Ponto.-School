"use client";
import React from "react";
import { BookPlus, MessageSquare, ArrowRight, Code, ChevronDown } from 'lucide-react';

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
        className={`quick-access-card ${selectedCard === "Criar aula" ? "selected" : ""}`}
        onClick={() => handleClick("Criar aula")}
      >
        <BookPlus className="quick-access-card-icon" />
        <span className="quick-access-card-text">Criar aula</span>
      </div>
      <div
        className={`quick-access-card ${selectedCard === "Chat School" ? "selected" : ""}`}
        onClick={() => handleClick("Chat School")}
      >
        <MessageSquare className="quick-access-card-icon" />
        <span className="quick-access-card-text">Chat School</span>
      </div>
      <div
        className={`quick-access-card ${selectedCard === "Flow School" ? "selected" : ""}`}
        onClick={() => handleClick("Flow School")}
      >
        <ArrowRight className="quick-access-card-icon" />
        <span className="quick-access-card-text">Flow School</span>
      </div>
      <div
        className={`quick-access-card ${selectedCard === "Desenvolver" ? "selected" : ""}`}
        onClick={() => handleClick("Desenvolver")}
      >
        <Code className="quick-access-card-icon" />
        <span className="quick-access-card-text">Desenvolver</span>
      </div>
      <div
        className={`quick-access-card ${selectedCard === "Mais" ? "selected" : ""}`}
        onClick={() => handleClick("Mais")}
      >
        <ChevronDown className="quick-access-card-icon" />
        <span className="quick-access-card-text">Mais</span>
      </div>
    </div>
  );
};