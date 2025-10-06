import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface TaskSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TaskSearch: React.FC<TaskSearchProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
        <Search className="h-4 w-4" />
      </div>
      <Input
        placeholder="Buscar tarefas..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-8 h-9 border-gray-200 dark:border-gray-700 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20 rounded-lg"
      />
      {searchQuery && (
        <button
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={() => setSearchQuery("")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default TaskSearch;
