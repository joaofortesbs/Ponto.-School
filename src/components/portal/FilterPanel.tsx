import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Turma } from "./TurmaCard";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mockTurmas: Turma[];
}

const FilterPanel = ({ isOpen, onClose, mockTurmas }: FilterPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-white dark:bg-[#001427]/60 rounded-lg p-4 shadow-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#001427] dark:text-white">
                Filtros
              </h3>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-[#001427] dark:text-white mb-2">
                  Tipo de Material
                </h4>
                <div className="space-y-2">
                  {["video", "pdf", "audio", "link", "exercise", "mindmap"].map(
                    (type) => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          className="h-4 w-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize"
                        >
                          {type}
                        </label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#001427] dark:text-white mb-2">
                  Turma
                </h4>
                <div className="space-y-2">
                  {mockTurmas.map((turma) => (
                    <div key={turma.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`turma-${turma.id}`}
                        className="h-4 w-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                      <label
                        htmlFor={`turma-${turma.id}`}
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {turma.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#001427] dark:text-white mb-2">
                  Status
                </h4>
                <div className="space-y-2">
                  {[
                    "Todos",
                    "Novos",
                    "Recomendados",
                    "Favoritos",
                    "Lidos",
                    "Não lidos",
                  ].map((status) => (
                    <div key={status} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        id={`status-${status}`}
                        className="h-4 w-4 border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={onClose}>
                Limpar Filtros
              </Button>
              <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterPanel;
