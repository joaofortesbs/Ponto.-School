import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Brain,
  Code,
  Edit,
  Globe,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

interface EditarPlanoProps {
  planoId: string;
  planos: any[];
  onCancel: () => void;
  onSave: () => void;
}

const EditarPlano = ({
  planoId,
  planos,
  onCancel,
  onSave,
}: EditarPlanoProps) => {
  const plano = planos.find((p) => p.id === planoId);
  if (!plano) return null;

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-[#FF6B00]/5 to-transparent dark:from-[#FF6B00]/10 dark:to-transparent">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <Edit className="h-6 w-6 text-[#FF6B00]" />
            </div>
            <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
              Editar Plano de Estudos
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Excluir Plano
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#29335C] dark:text-white mb-1">
                Nome do Plano
              </label>
              <Input
                defaultValue={plano.nome}
                className="bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#29335C] dark:text-white mb-1">
                Descrição
              </label>
              <textarea
                defaultValue={plano.descricao}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#29335C]/20 p-3 text-sm text-[#29335C] dark:text-white focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 min-h-[100px]"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#29335C] dark:text-white mb-1">
                  Data de Início
                </label>
                <Input
                  type="text"
                  defaultValue={plano.dataInicio}
                  className="bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#29335C] dark:text-white mb-1">
                  Data de Término
                </label>
                <Input
                  type="text"
                  defaultValue={plano.dataFim}
                  className="bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#29335C] dark:text-white mb-1">
                Tipo de Plano
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`border ${plano.tipo === "personalizado" ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-gray-200 dark:border-gray-700"} rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 transition-colors`}
                >
                  <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Personalizado
                  </span>
                </div>
                <div
                  className={`border ${plano.tipo === "curso" ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-gray-200 dark:border-gray-700"} rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 transition-colors`}
                >
                  <Code className="h-6 w-6 text-[#FF6B00]" />
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Curso
                  </span>
                </div>
                <div
                  className={`border ${plano.tipo === "idioma" ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-gray-200 dark:border-gray-700"} rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 transition-colors`}
                >
                  <Globe className="h-6 w-6 text-[#FF6B00]" />
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Idioma
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#29335C] dark:text-white mb-1">
                Matérias
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-[#29335C]/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nome da matéria"
                    className="bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700"
                  />
                  <Input
                    type="color"
                    defaultValue="#FF6B00"
                    className="w-12 h-10 p-1 bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {plano.materias.map((materia: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#29335C]/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: materia.cor }}
                      ></div>
                      <span className="text-sm text-[#29335C] dark:text-white">
                        {materia.nome}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#29335C] dark:text-white mb-1">
                Metas
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-[#29335C]/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Descrição da meta"
                    className="bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {plano.metas.map((meta: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#29335C]/30 rounded-lg"
                  >
                    <span className="text-sm text-[#29335C] dark:text-white">
                      {meta.nome}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-4 rounded-lg text-white">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-1">
                    Otimização de Plano{" "}
                    <Sparkles className="h-3.5 w-3.5 text-[#FF6B00]" />
                  </h4>
                  <p className="text-sm text-white/80 mb-3">
                    O Epictus IA pode analisar seu plano atual e sugerir
                    melhorias para otimizar seu aprendizado e aumentar sua
                    produtividade.
                  </p>
                  <Button className="bg-white text-[#29335C] hover:bg-white/90 text-sm">
                    Otimizar Plano
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            onClick={onSave}
          >
            <Save className="h-4 w-4 mr-1" /> Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditarPlano;
