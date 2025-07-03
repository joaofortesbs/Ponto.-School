
import React from "react";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

interface RemoverMembroComponentProps {
  onClick: () => void;
}

const RemoverMembroComponent: React.FC<RemoverMembroComponentProps> = ({ onClick }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 rounded-full hover:bg-[#FF6B00]/20 text-[#FF6B00] hover:text-[#FF8C40] transition-colors"
      onClick={onClick}
    >
      <UserMinus className="h-3.5 w-3.5" />
    </Button>
  );
};

export default RemoverMembroComponent;
