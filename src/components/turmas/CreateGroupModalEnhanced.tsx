
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Users, Plus, Key, Lock, BookOpen, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const colorOptions = [
  "#FF6B00", // Laranja principal
  "#4F46E5", // Índigo
  "#10B981", // Esmeralda
  "#8B5CF6", // Violeta
  "#EC4899", // Rosa
  "#F59E0B", // Âmbar
  "#06B6D4", // Ciano
  "#EF4444", // Vermelho
];

const CreateGroupModalEnhanced: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<string>("criar");
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    privado: false,
    cor: "#FF6B00",
    codigo: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, cor: color }));
  };

  const handlePrivacyToggle = () => {
    setFormData(prev => ({ ...prev, privado: !prev.privado }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para entrar em um grupo usando código
    console.log("Entrando com código:", formData.codigo);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden max-w-2xl w-full shadow-xl relative"
          >
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Users className="h-6 w-6 mr-3" />
                  Adicionar Novo Grupo de Estudos
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Conecte-se com outros estudantes para compartilhar conhecimento
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <Tabs 
                defaultValue="criar" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="codigo" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <span>Código de acesso</span>
                  </TabsTrigger>
                  <TabsTrigger value="criar" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Criar Grupo</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="codigo" className="mt-0">
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center mb-4">
                      <Lock className="h-10 w-10 mx-auto text-[#FF6B00] mb-2" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Entrar em um grupo existente
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Digite o código de acesso fornecido pelo administrador do grupo
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        placeholder="Digite o código do grupo"
                        className="text-center text-xl tracking-wider font-medium h-12"
                        maxLength={10}
                        autoComplete="off"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        O código é sensível a maiúsculas e minúsculas
                      </p>
                    </div>
                    
                    <div className="flex justify-end pt-4 space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white"
                      >
                        Entrar no Grupo
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="criar" className="mt-0">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium mb-1">
                          Nome do Grupo *
                        </label>
                        <Input
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          placeholder="Ex: Estudo de Cálculo Avançado"
                          required
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="descricao" className="block text-sm font-medium mb-1">
                          Descrição
                        </label>
                        <Textarea
                          id="descricao"
                          name="descricao"
                          value={formData.descricao}
                          onChange={handleInputChange}
                          placeholder="Descreva o objetivo do seu grupo de estudos"
                          className="w-full resize-none min-h-[80px]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <div className="flex items-center">
                            <Palette className="h-4 w-4 mr-1" />
                            <span>Cor do Grupo</span>
                          </div>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {colorOptions.map((color) => (
                            <div
                              key={color}
                              onClick={() => handleColorSelect(color)}
                              className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                formData.cor === color ? 'ring-2 ring-offset-2 ring-gray-700 dark:ring-gray-300 scale-110' : ''
                              }`}
                              style={{ backgroundColor: color }}
                            >
                              {formData.cor === color && (
                                <div className="text-white">✓</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="privado"
                            checked={formData.privado}
                            onChange={handlePrivacyToggle}
                            className="h-4 w-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                          />
                          <label htmlFor="privado" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Grupo privado (somente com código de acesso)
                          </label>
                        </div>
                        {formData.privado && (
                          <p className="text-xs text-gray-500 mt-1 ml-6">
                            Um código de acesso será gerado automaticamente quando o grupo for criado
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Criar Grupo
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModalEnhanced;
