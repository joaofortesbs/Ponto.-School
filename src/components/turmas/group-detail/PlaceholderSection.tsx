
import React from 'react';

interface PlaceholderSectionProps {
  title: string;
  message: string;
}

export default function PlaceholderSection({ title, message }: PlaceholderSectionProps) {
  return (
    <div className="flex items-center justify-center h-full bg-white dark:bg-[#001427]">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
}
