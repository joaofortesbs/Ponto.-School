"use client";
import React from "react";
import { BookPlus, MessageSquare, GitBranch, Code, Plus } from 'lucide-react';

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
        className={`quick-access-card ${selectedCard === "Aulas" ? "selected" : ""}`}
        onClick={() => handleClick("Aulas")}
      >
        <BookPlus className="quick-access-card-icon" />
        <span className="quick-access-card-text">Aulas</span>
      </div>
      <div
        className={`quick-access-card ${selectedCard === "Chats" ? "selected" : ""}`}
        onClick={() => handleClick("Chats")}
      >
        <MessageSquare className="quick-access-card-icon" />
        <span className="quick-access-card-text">Chats</span>
      </div>
      <div
        className={`quick-access-card ${selectedCard === "Flows" ? "selected" : ""}`}
        onClick={() => handleClick("Flows")}
      >
        <GitBranch className="quick-access-card-icon" />
        <span className="quick-access-card-text">Flows</span>
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
        <Plus className="quick-access-card-icon" />
        <span className="quick-access-card-text">Mais</span>
      </div>
    </div>
  );
};