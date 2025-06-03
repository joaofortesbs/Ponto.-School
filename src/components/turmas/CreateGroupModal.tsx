
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    topico: "Matemática",
    tipo_grupo: "Matérias Básicas",
    disciplina_area: "",
    topico_especifico: "",
    tags: "",
    privacidade: "publico",
    visibilidade: "all"
  });

  const [partners, setPartners] = useState<any[]>([]);
  const [searchPartner, setSearchPartner] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topics = [
    { value: "Matemática", label: "📏 Matemática" },
    { value: "História", label: "📚 História" },
    { value: "Ciências", label: "🔬 Ciências" },
    { value: "Língua Portuguesa", label: "📖 Língua Portuguesa" },
    { value: "Geografia", label: "🌍 Geografia" },
    { value: "Física", label: "⚡ Física" },
    { value: "Química", label: "🧪 Química" },
    { value: "Biologia", label: "🌿 Biologia" },
    { value: "Inglês", label: "🇺🇸 Inglês" },
    { value: "Outros", label: "🎯 Outros" }
  ];

  const groupTypes = [
    "Matérias Básicas",
    "ENEM & Exames",
    "Interesses & Habilidades",
    "Projetos & Atividades",
    "Grupos de Apoio",
    "Outros"
  ];

  const generateUniqueCode = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return (timestamp + random).toUpperCase().substring(0, 8);
  };

  const loadPartners = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: partnersData, error } = await supabase
        .from('parceiros')
        .select(`
          parceiro_id,
          profiles!parceiros_parceiro_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao carregar parceiros:', error);
        return;
      }

      setPartners(partnersData || []);
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPartners();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('Nome do grupo é obrigatório!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Você precisa estar logado para criar um grupo');
      }

      const codigoUnico = generateUniqueCode();
      const selectedTopic = topics.find(t => t.value === formData.topico);
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const groupData = {
        codigo_unico: codigoUnico,
        user_id: user.id,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        topico: formData.topico,
        topico_nome: selectedTopic?.label || formData.topico,
        topico_icon: selectedTopic?.label.split(' ')[0] || "📚",
        tipo_grupo: formData.tipo_grupo,
        disciplina_area: formData.disciplina_area.trim() || null,
        topico_especifico: formData.topico_especifico.trim() || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        cor: "#FF6B00",
        privado: formData.privacidade === "privado",
        is_publico: formData.privacidade === "publico",
        is_visible_to_all: formData.visibilidade === "all",
        is_visible_to_partners: formData.visibilidade === "partners",
        membros: 1
      };

      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert(groupData)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: data.id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        throw memberError;
      }
      
      alert(`Grupo criado com sucesso! Código: ${codigoUnico}`);
      onSubmit({ ...groupData, ...data });
      setFormData({
        nome: "",
        descricao: "",
        topico: "Matemática",
        tipo_grupo: "Matérias Básicas",
        disciplina_area: "",
        topico_especifico: "",
        tags: "",
        privacidade: "publico",
        visibilidade: "all"
      });
        
    } catch (error: any) {
      console.error('Erro ao criar grupo:', error);
      alert(`Erro ao criar grupo: ${error.message}`);
    }
    
    setIsSubmitting(false);
  };

  const filteredPartners = partners.filter(partner =>
    partner.profiles?.display_name?.toLowerCase().includes(searchPartner.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Criar Novo Grupo</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Mini-Seção 1: Informações Básicas */}
              <div className="space-y-4 p-4 bg-[#2a4066] dark:bg-gray-800 rounded-lg">
                <h4 className="text-lg font-semibold text-[#f4a261] dark:text-orange-400">Informações Básicas</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-white">Nome do grupo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Digite o nome do grupo"
                      required
                      className="bg-[#1a2a44] border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="topico" className="text-white">Tópico de estudo</Label>
                    <Select
                      value={formData.topico}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, topico: value }))}
                    >
                      <SelectTrigger className="bg-[#1a2a44] border-gray-600 text-white">
                        <SelectValue placeholder="Selecione um tópico" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.value} value={topic.value}>
                            {topic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-white">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Digite a descrição do grupo"
                    className="bg-[#1a2a44] border-gray-600 text-white min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_grupo" className="text-white">Tipo do grupo</Label>
                    <Select
                      value={formData.tipo_grupo}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_grupo: value }))}
                    >
                      <SelectTrigger className="bg-[#1a2a44] border-gray-600 text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="disciplina_area" className="text-white">Disciplina/Área</Label>
                    <Input
                      id="disciplina_area"
                      value={formData.disciplina_area}
                      onChange={(e) => setFormData(prev => ({ ...prev, disciplina_area: e.target.value }))}
                      placeholder="Ex.: Matemática"
                      className="bg-[#1a2a44] border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="topico_especifico" className="text-white">Tópico Específico</Label>
                    <Input
                      id="topico_especifico"
                      value={formData.topico_especifico}
                      onChange={(e) => setFormData(prev => ({ ...prev, topico_especifico: e.target.value }))}
                      placeholder="Ex.: Álgebra Linear"
                      className="bg-[#1a2a44] border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags" className="text-white">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Ex.: cálculo, matemática (separar por vírgulas)"
                      className="bg-[#1a2a44] border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Mini-Seção 2: Configurações */}
              <div className="space-y-4 p-4 bg-[#2a4066] dark:bg-gray-800 rounded-lg">
                <h4 className="text-lg font-semibold text-[#f4a261] dark:text-orange-400">Configurações</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white font-medium">Privacidade do grupo</Label>
                    <RadioGroup
                      value={formData.privacidade}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, privacidade: value }))}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="publico" id="publico" />
                        <Label htmlFor="publico" className="text-white">Público</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="privado" id="privado" />
                        <Label htmlFor="privado" className="text-white">Privado</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-white font-medium">Visibilidade do grupo</Label>
                    <RadioGroup
                      value={formData.visibilidade}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, visibilidade: value }))}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="visibilidade-todos" />
                        <Label htmlFor="visibilidade-todos" className="text-white">Permitir que todos vejam</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partners" id="visibilidade-parceiros" />
                        <Label htmlFor="visibilidade-parceiros" className="text-white">Permitir que meus Parceiros vejam</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* Mini-Seção 3: Participantes */}
              <div className="space-y-4 p-4 bg-[#2a4066] dark:bg-gray-800 rounded-lg">
                <h4 className="text-lg font-semibold text-[#f4a261] dark:text-orange-400">Participantes</h4>
                
                <div className="bg-[#1a2a44] dark:bg-gray-900 p-4 rounded-lg">
                  <h5 className="text-white font-medium mb-3">Convidar Participantes</h5>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchPartner}
                      onChange={(e) => setSearchPartner(e.target.value)}
                      placeholder="Pesquisar Parceiros"
                      className="pl-10 bg-[#2a4066] border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {filteredPartners.length > 0 ? (
                      filteredPartners.map((partner) => (
                        <div key={partner.parceiro_id} className="flex justify-between items-center p-2 bg-[#2a4066] rounded">
                          <span className="text-white">{partner.profiles?.display_name || 'Usuário'}</span>
                          <Button 
                            type="button"
                            disabled 
                            className="bg-gray-500 text-white cursor-not-allowed"
                            size="sm"
                          >
                            Convidar
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">
                        {searchPartner ? 'Nenhum parceiro encontrado.' : 'Nenhum parceiro disponível.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mini-Seção 4: Prévia do Grupo */}
              <div className="space-y-4 p-4 bg-[#2a4066] dark:bg-gray-800 rounded-lg">
                <h4 className="text-lg font-semibold text-[#f4a261] dark:text-orange-400">Prévia do Grupo</h4>
                
                <div className="bg-[#1a2a44] dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-white font-bold text-lg mb-2">{formData.nome || 'Nome do Grupo'}</h4>
                  <p className="text-gray-300 mb-2">Descrição: {formData.descricao || 'Descrição do grupo'}</p>
                  <p className="text-gray-300 mb-2">Tópico: {formData.topico}</p>
                  <p className="text-gray-300 mb-2">Tipo de Grupo: {formData.tipo_grupo}</p>
                  <p className="text-gray-300 mb-2">Disciplina/Área: {formData.disciplina_area || 'Não especificado'}</p>
                  <p className="text-gray-300 mb-2">Tópico Específico: {formData.topico_especifico || 'Não especificado'}</p>
                  <p className="text-gray-300 mb-2">Tags: {formData.tags || 'Nenhuma tag'}</p>
                  <p className="text-gray-300">Status: {formData.privacidade === 'publico' ? 'Público' : 'Privado'}</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Grupo'}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
