
"use client";
import React from "react";
import { BookOpen, Zap, Brain, GraduationCap } from 'lucide-react';
import { useIsMobile } from "@/hooks/useIsMobile";

interface QuickAccessCardsProps {
  onCardClick?: (cardName: string, cardText: string) => void;
  selectedCard?: string | null;
  isQuizMode?: boolean;
}

const QuickAccessCards: React.FC<QuickAccessCardsProps> = ({ 
  onCardClick, 
  selectedCard = null,
  isQuizMode = false 
}) => {
  const isMobile = useIsMobile();

  const cardTexts: { [key: string]: string } = {
    "Plano ENEM": "Preciso criar atividades interativas focadas na preparação no ENEM para estudantes, sobre o tema:",
    "Aula Turbo": "Preciso criar atividades interativas focadas na criação de uma aula que engaja meus alunos, conclui habilidades e cumpri os critérios da minha grade, sobre o tema:",
    "Criando Gênios": "Preciso criar atividades interativas focadas na exploração de habilidades dos estudantes, para a conclusão e trilhagem de novas áreas, sobre o tema:",
    "Escola Viva": "Preciso criar atividades interativas focadas na em engajar o público da minha escola, e criar o senso a cultura viva entre os alunos, sobre o tema:"
  };

  const handleCardClick = (cardName: string) => {
    if (onCardClick) {
      onCardClick(cardName, cardTexts[cardName]);
    }
  };

  return (
    <div className="quick-access-cards-container">
      <style>{`
        .quick-access-cards-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
          margin: 8px 0 0 0;
        }

        .quick-access-cards {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          width: 100%;
          max-width: 800px;
          padding: 0 2px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .quick-access-cards {
            gap: 8px;
            margin: 0;
          }
        }

        .quick-access-card {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0;
          padding: 10px 11px;
          background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
          border: 1px solid #333;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          min-height: 44px;
          max-height: 44px;
        }

        @media (max-width: 768px) {
          .quick-access-card {
            padding: 10px 12px;
            border-radius: 999px;
            min-height: 40px;
            max-height: 40px;
          }
        }

        .quick-access-card:hover {
          background: linear-gradient(145deg, #333, #2a2a2a);
          border-color: rgba(255, 107, 0, 0.4);
          box-shadow:
            0 6px 12px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(255, 107, 0, 0.15);
          transform: translateY(-2px);
        }

        .quick-access-card-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          color: #ff6b35;
          transition: all 0.3s ease;
          margin-right: 12px;
        }

        @media (max-width: 768px) {
          .quick-access-card-icon {
            width: 20px;
            height: 20px;
            margin-right: 17px;
          }
        }

        .quick-access-card:hover .quick-access-card-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 0 8px rgba(255, 107, 0, 0.6));
        }

        .quick-access-card-text {
          font-size: 13px;
          font-weight: 500;
          color: #e0e0e0;
          white-space: nowrap;
          transition: color 0.3s ease;
          margin: 0;
          padding: 0;
        }

        @media (max-width: 768px) {
          .quick-access-card-text {
            font-size: 11px;
          }
        }

        .quick-access-card:hover .quick-access-card-text {
          color: #ff6b35;
        }

        .quick-access-card.selected {
          background: linear-gradient(145deg, #ff6b35, #f7931e);
          border-color: #ff6b35;
          box-shadow:
            0 8px 16px rgba(255, 107, 53, 0.4),
            0 4px 8px rgba(255, 107, 53, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .quick-access-card.selected .quick-access-card-icon {
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .quick-access-card.selected .quick-access-card-text {
          color: white;
          font-weight: 600;
        }
      `}</style>

      <div className="quick-access-cards">
        <div 
          className={`quick-access-card ${selectedCard === "Plano ENEM" ? "selected" : ""}`} 
          onClick={() => handleCardClick("Plano ENEM")}
        >
          <BookOpen className="quick-access-card-icon" />
          <span className="quick-access-card-text">Plano ENEM</span>
        </div>
        
        <div 
          className={`quick-access-card ${selectedCard === "Aula Turbo" ? "selected" : ""}`} 
          onClick={() => handleCardClick("Aula Turbo")}
        >
          <Zap className="quick-access-card-icon" />
          <span className="quick-access-card-text">Aula Turbo</span>
        </div>
        
        <div 
          className={`quick-access-card ${selectedCard === "Criando Gênios" ? "selected" : ""}`} 
          onClick={() => handleCardClick("Criando Gênios")}
        >
          <Brain className="quick-access-card-icon" />
          <span className="quick-access-card-text">Criando Gênios</span>
        </div>
        
        <div 
          className={`quick-access-card ${selectedCard === "Escola Viva" ? "selected" : ""}`} 
          onClick={() => handleCardClick("Escola Viva")}
        >
          <GraduationCap className="quick-access-card-icon" />
          <span className="quick-access-card-text">Escola Viva</span>
        </div>
      </div>
    </div>
  );
};

export default QuickAccessCards;
