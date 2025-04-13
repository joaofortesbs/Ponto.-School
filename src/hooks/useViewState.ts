
import { useState } from "react";

interface ViewStateOptions<T extends string, S extends string> {
  defaultViewMode?: T;
  defaultSortOption?: S;
}

/**
 * Custom hook for managing view mode, sorting, and filtering states
 */
export function useViewState<
  T extends string = "grid" | "list", 
  S extends string = "relevance" | "date" | "alphabetical" | "type" | "popular"
>(options?: ViewStateOptions<T, S>) {
  const [viewMode, setViewMode] = useState<T>(
    (options?.defaultViewMode || "grid") as T
  );
  
  const [sortOption, setSortOption] = useState<S>(
    (options?.defaultSortOption || "relevance") as S
  );
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState<Record<string, boolean>>({});

  const handleViewModeChange = (mode: T) => {
    setViewMode(mode);
  };

  const handleSortChange = (option: S) => {
    setSortOption(option);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (key: string, value: boolean) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    viewMode,
    sortOption,
    searchQuery,
    filterOptions,
    handleViewModeChange,
    handleSortChange,
    handleSearch,
    handleFilterChange
  };
}
