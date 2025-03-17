import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "relevance" | "date" | "alphabetical" | "type" | "popular";

interface SortDropdownProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const SortDropdown = ({ sortOption, onSortChange }: SortDropdownProps) => {
  return (
    <Select
      value={sortOption}
      onValueChange={(value) => onSortChange(value as SortOption)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance">Relevância</SelectItem>
        <SelectItem value="date">Data (mais recente)</SelectItem>
        <SelectItem value="alphabetical">Ordem alfabética</SelectItem>
        <SelectItem value="type">Tipo de material</SelectItem>
        <SelectItem value="popular">Mais acessados</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortDropdown;
