
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Save, X } from "lucide-react";

interface Interest {
  id: string;
  name: string;
  category: string;
}

interface AddInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: Interest[]) => void;
  existingInterests: Interest[];
}

export default function AddInterestsModal({ isOpen, onClose, onSave, existingInterests }: AddInterestsModalProps) {
  const [interests, setInterests] = useState<Interest[]>(existingInterests);
  const [newInterest, setNewInterest] = useState({
    name: "",
    category: ""
  });

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

  const handleAddInterest = () => {
    if (!newInterest.name || !newInterest.category) return;
    
    const interest: Interest = {
      id: Date.now().toString(),
      name: newInterest.name,
      category: newInterest.category
    };
    
    setInterests([...interests, interest]);
    setNewInterest({ name: "", category: "" });
  };

  const handleRemoveInterest = (id: string) => {
    setInterests(interests.filter(interest => interest.id !== id));
  };

  const handleSave = () => {
    onSave(interests);
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
            Gerenciar Interesses
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add new interest form */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <h4 className="font-medium text-[#29335C] dark:text-white">Adicionar Novo Interesse</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#29335C] dark:text-white font-medium">Nome *</Label>
                <Input
                  value={newInterest.name}
                  onChange={(e) => setNewInterest({ ...newInterest, name: e.target.value })}
                  placeholder="Ex: Futebol, Piano, Programação..."
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#29335C] dark:text-white font-medium">Categoria *</Label>
                <Select value={newInterest.category} onValueChange={(value) => setNewInterest({ ...newInterest, category: value })}>
                  <SelectTrigger className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]">
                    <SelectValue placeholder="Selecione a categoria" />
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
              onClick={handleAddInterest}
              disabled={!newInterest.name || !newInterest.category}
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Interesse
            </Button>
          </div>

          {/* Interests list */}
          {interests.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-[#29335C] dark:text-white">
                Seus Interesses ({interests.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {interests.map((interest) => (
                  <div key={interest.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <Badge className={getCategoryColor(interest.category)}>
                        <Heart className="h-3 w-3 mr-1" />
                        {interest.name}
                      </Badge>
                      <span className="text-sm text-[#64748B] dark:text-white/60">
                        {interest.category}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInterest(interest.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60 hover:border-[#29335C] hover:text-[#29335C]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Interesses
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
