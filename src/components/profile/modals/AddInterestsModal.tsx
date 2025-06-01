
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus } from "lucide-react";
import { UserInterest } from "@/services/profileDataService";

interface AddInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: UserInterest[]) => void;
  existingInterests: UserInterest[];
}

export default function AddInterestsModal({ isOpen, onClose, onSave, existingInterests }: AddInterestsModalProps) {
  const [interestName, setInterestName] = useState("");
  const [interestCategory, setInterestCategory] = useState("");
  const [tempInterests, setTempInterests] = useState<UserInterest[]>([]);

  const categories = [
    "Tecnologia",
    "Esportes",
    "Arte & Cultura",
    "Música",
    "Cinema & TV",
    "Literatura",
    "Culinária",
    "Viagens",
    "Natureza",
    "Jogos",
    "Educação",
    "Ciência",
    "Empreendedorismo",
    "Saúde & Bem-estar"
  ];

  const addInterest = () => {
    if (!interestName || !interestCategory) return;

    const newInterest: UserInterest = {
      id: Date.now().toString(),
      name: interestName,
      category: interestCategory
    };

    setTempInterests([...tempInterests, newInterest]);
    setInterestName("");
    setInterestCategory("");
  };

  const removeInterest = (id: string) => {
    setTempInterests(tempInterests.filter(interest => interest.id !== id));
  };

  const handleSave = () => {
    const allInterests = [...existingInterests, ...tempInterests];
    onSave(allInterests);
    setTempInterests([]);
    onClose();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Tecnologia": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "Esportes": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "Arte & Cultura": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      "Música": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      "Cinema & TV": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      "Literatura": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      "Culinária": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      "Viagens": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      "Natureza": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      "Jogos": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      "Educação": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
      "Ciência": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      "Empreendedorismo": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
      "Saúde & Bem-estar": "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#0A2540] border border-[#E0E1DD] dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-[#29335C] dark:text-white">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-[#FF6B00]" />
            </div>
            Adicionar Interesses
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Interesse
              </Label>
              <Input
                value={interestName}
                onChange={(e) => setInterestName(e.target.value)}
                placeholder="Ex: Futebol, Programação, Culinária..."
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Categoria
              </Label>
              <Select value={interestCategory} onValueChange={setInterestCategory}>
                <SelectTrigger className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={addInterest}
            disabled={!interestName || !interestCategory}
            className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Interesse
          </Button>

          {tempInterests.length > 0 && (
            <div className="space-y-3 border-t border-[#E0E1DD] dark:border-white/10 pt-4">
              <h4 className="text-sm font-medium text-[#29335C] dark:text-white">
                Interesses a serem adicionados:
              </h4>
              <div className="flex flex-wrap gap-2">
                {tempInterests.map((interest) => (
                  <Badge
                    key={interest.id}
                    className={`${getCategoryColor(interest.category)} transition-all cursor-default group relative`}
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    {interest.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterest(interest.id)}
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-red-500 hover:text-red-700 bg-white rounded-full border border-red-300"
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={tempInterests.length === 0}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            Salvar {tempInterests.length} Interesse(s)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
