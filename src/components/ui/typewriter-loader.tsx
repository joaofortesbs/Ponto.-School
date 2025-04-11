
import React from "react";
import "../../styles/typewriter-loader.css";

interface TypewriterLoaderProps {
  className?: string;
}

export const TypewriterLoader: React.FC<TypewriterLoaderProps> = ({ className }) => {
  return (
    <div className={`typewriter-container ${className || ""}`}>
      <div className="typewriter">
        <div className="slide"><i></i></div>
        <div className="paper"></div>
        <div className="keyboard"></div>
      </div>
    </div>
  );
};
