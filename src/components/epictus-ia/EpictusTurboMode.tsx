
import React from "react";
import { useTheme } from "@/components/ThemeProvider";

const EpictusTurboMode: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="w-full flex flex-col items-center">
      <h2 
        className="text-4xl font-bold text-center mt-10 mb-6 bg-clip-text text-transparent"
        style={{
          backgroundImage: "linear-gradient(to right, #1E3A8A, #F97316)",
          fontFamily: "'Montserrat', 'Poppins', sans-serif",
          textShadow: "0 0 10px rgba(249, 115, 22, 0.5)"
        }}
      >
        Epictus Turbo
      </h2>
      
      <div className="w-full h-[60vh] flex items-center justify-center">
        <p 
          className={`text-2xl ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          Esta seção está em desenvolvimento
        </p>
      </div>
    </div>
  );
};

export default EpictusTurboMode;
