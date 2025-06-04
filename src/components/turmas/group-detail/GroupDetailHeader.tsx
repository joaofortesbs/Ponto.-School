import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GroupDetailHeaderProps {
  groupName: string;
  onBack: () => void;
}

export default function GroupDetailHeader({ groupName, onBack }: GroupDetailHeaderProps) {
  return (
    <div className="group-header">
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      <h1 className="text-xl font-bold text-[#FF6B00] ml-4">
        {groupName}
      </h1>
    </div>
  );
}