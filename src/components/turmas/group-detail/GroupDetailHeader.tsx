
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GroupDetailHeaderProps {
  groupName: string;
  onBack: () => void;
}

export default function GroupDetailHeader({ groupName, onBack }: GroupDetailHeaderProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-700">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] dark:hover:text-[#FF6B00]"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {groupName}
      </h1>
    </div>
  );
}
