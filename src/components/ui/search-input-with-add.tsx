
import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "./input";
import { AddButton } from "./add-button";

interface SearchInputWithAddProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchInputWithAdd({ 
  placeholder = "Digite um comando...", 
  onChange, 
  className = "" 
}: SearchInputWithAddProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-9 bg-[#001427]/80 text-white placeholder:text-gray-400 border-0 rounded-md"
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
      <div className="ml-2">
        <AddButton />
      </div>
    </div>
  );
}
