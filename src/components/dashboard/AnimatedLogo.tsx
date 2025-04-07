import React from "react";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = "md",
  className = "",
}) => {
  // Define sizes based on the size prop
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}
    >
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00] via-[#FF8C40] to-[#FFD700] rounded-full opacity-70 blur-[6px] group-hover:opacity-100 group-hover:blur-[8px] transition-all duration-500"></div>

      {/* Logo container */}
      <div
        className={`${sizes[size]} relative z-10 flex items-center justify-center text-white font-bold bg-[#FF6B00] rounded-full overflow-hidden`}
      >
        {/* Text logo */}
        <span className="text-white font-bold text-xl tracking-tighter">
          P.
        </span>

        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
      </div>
    </div>
  );
};

export default AnimatedLogo;
