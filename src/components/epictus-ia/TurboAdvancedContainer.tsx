
import React from "react";

interface TurboAdvancedContainerProps {
  children: React.ReactNode;
}

const TurboAdvancedContainer: React.FC<TurboAdvancedContainerProps> = ({ children }) => {
  return (
    <div className="w-full p-4 -mt-2">
      <div className="w-full hub-connected-width backdrop-blur-md bg-white/10 dark:bg-black/10 border border-[#0071f0] rounded-xl shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default TurboAdvancedContainer;
