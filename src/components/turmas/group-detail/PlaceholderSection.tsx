import React from 'react';
import { Construction } from "lucide-react";

interface PlaceholderSectionProps {
  title: string;
  message: string;
}

export default function PlaceholderSection({ title, message }: PlaceholderSectionProps) {
  return (
    <div className="placeholder-section h-full flex items-center justify-center">
      <div className="text-center">
        <Construction className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}