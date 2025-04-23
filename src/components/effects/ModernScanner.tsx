import React from "react";
import "../../styles/modern-scanner.css";

const ModernScanner: React.FC = () => {
  return (
    <div className="scanner-container">
      <div className="scanner-text-wrapper">
        <div className="welcome-text">
          <span style={{ fontWeight: 'normal' }}>Como a IA mais </span>
          <span className="scanner-text">Inteligente do mundo</span>
          <span style={{ fontWeight: 'normal' }}> pode te ajudar hoje user_848553?</span>
        </div>
        <span className="scanner-line"></span>
      </div>
    </div>
  );
};

export default ModernScanner;