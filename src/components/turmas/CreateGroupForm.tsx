
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface CreateGroupFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

interface Partner {
  parceiro_id: string;
  profiles?: {
    display_name?: string;
    full_name?: string;
  };
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onSubmit, onCancel }) => {
  // Estados do formulário
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupType, setGroupType] = useState("");
  const [groupDiscipline, setGroupDiscipline] = useState("");
  const [groupSpecificTopic, setGroupSpecificTopic] = useState("");
  const [groupTags, setGroupTags] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState("public");
  const [groupVisibility, setGroupVisibility] = useState("all");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [invitedPartners, setInvitedPartners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função de depuração detalhada para carregar parceiros
  const loadPartners = async () => {
    console.log('🔍 Iniciando função loadPartners...');
    setIsLoading(true);
    
    try {
      // Passo 1: Obter o ID do usuário logado
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        console.error('❌ Erro ao obter usuário logado:', authError);
        toast({
          title: "Erro de autenticação",
          description: "Erro ao identificar usuário. Faça login novamente.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const userId = userData.user.id;
      console.log('✅ Usuário logado com ID:', userId);

      // Passo 2: Buscar os parceiros do usuário na tabela 'parceiros'
      console.log('🔍 Consultando tabela parceiros...');
      const { data: partnersData, error } = await supabase
        .from('parceiros')
        .select(`
          parceiro_id,
          profiles!parceiros_parceiro_id_fkey (
            display_name,
            full_name
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao consultar tabela parceiros:', error);
        toast({
          title: "Erro ao carregar parceiros",
          description: "Erro ao consultar banco de dados. Tente novamente.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log('📊 Dados retornados da tabela parceiros:', partnersData);

      // Passo 3: Verificar se há parceiros
      if (!partnersData || partnersData.length === 0) {
        console.log('ℹ️ Nenhum parceiro encontrado para o usuário:', userId);
        setPartners([]);
        setIsLoading(false);
        return;
      }

      // Passo 4: Processar e validar dados dos parceiros
      const validPartners = partnersData.filter(partner => {
        if (!partner.profiles) {
          console.warn('⚠️ Parceiro sem dados de perfil:', partner);
          return false;
        }
        return true;
      });

      console.log('✅ Parceiros válidos encontrados:', validPartners.length);
      setPartners(validPartners || []);
      
    } catch (error) {
      console.error('❌ Erro geral na função loadPartners:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro inesperado ao carregar parceiros.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar parceiros ao montar o componente
  useEffect(() => {
    console.log('🚀 Componente CreateGroupForm montado, carregando parceiros...');
    loadPartners();
  }, []);

  // Filtrar parceiros com base na pesquisa
  const filteredPartners = partners.filter(partner => {
    const name = partner.profiles?.display_name || partner.profiles?.full_name || 'Nome não disponível';
    const searchResult = name.toLowerCase().includes(searchQuery.toLowerCase());
    console.log(`🔍 Filtrando parceiro "${name}" com termo "${searchQuery}":`, searchResult);
    return searchResult;
  });

  const handleInvitePartner = (partnerId: string) => {
    console.log('🎯 Botão Convidar clicado para parceiro ID:', partnerId);
    
    setInvitedPartners(prev => {
      // Se já estiver convidado, remova o convite
      if (prev.includes(partnerId)) {
        console.log('↩️ Removendo convite do parceiro:', partnerId);
        return prev.filter(id => id !== partnerId);
      } 
      // Senão, adicione o convite
      console.log('➕ Adicionando convite do parceiro:', partnerId);
      const newList = [...prev, partnerId];
      console.log('📝 Lista atualizada de convidados:', newList);
      return newList;
    });
  };

  const isPartnerInvited = (partnerId: string) => invitedPartners.includes(partnerId);

  const handleSubmit = () => {
    console.log('📤 Enviando formulário...');
    
    if (!groupName || !groupDescription || !groupType || !groupDiscipline || !groupSpecificTopic) {
      console.log('❌ Campos obrigatórios não preenchidos');
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const tags = groupTags ? groupTags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const formData = {
      nome: groupName,
      descricao: groupDescription,
      tipo_grupo: groupType,
      disciplina_area: groupDiscipline,
      topico_especifico: groupSpecificTopic,
      tags: tags,
      is_publico: groupPrivacy === "public",
      is_visible_to_all: groupVisibility === "all",
      is_visible_to_partners: groupVisibility === "partners",
      invitedPartners: invitedPartners
    };

    console.log('📋 Dados do formulário:', formData);
    console.log('👥 Parceiros convidados:', invitedPartners);
    onSubmit(formData);
  };

  // Gerar prévia do grupo
  const renderGroupPreview = () => {
    const tags = groupTags ? groupTags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    const isPublic = groupPrivacy === "public" ? "Público" : "Privado";
    const visibility = groupVisibility === "all" ? "Todos podem ver" : "Apenas Parceiros podem ver";

    return (
      <div className="space-y-3">
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">
            {groupName || "Nome do grupo"}
          </h4>
          <p className="text-gray-300 text-sm">
            {groupDescription || "Descrição do grupo"}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Tipo:</span>
            <p className="text-white">{groupType || "Não selecionado"}</p>
          </div>
          <div>
            <span className="text-gray-400">Disciplina:</span>
            <p className="text-white">{groupDiscipline || "Não especificada"}</p>
          </div>
          <div>
            <span className="text-gray-400">Tópico:</span>
            <p className="text-white">{groupSpecificTopic || "Não especificado"}</p>
          </div>
          <div>
            <span className="text-gray-400">Privacidade:</span>
            <p className="text-white">{isPublic}</p>
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <span className="text-gray-400 text-xs">Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="text-gray-400 text-xs">Visibilidade:</span>
          <p className="text-white text-xs">{visibility}</p>
        </div>

        {invitedPartners.length > 0 && (
          <div>
            <span className="text-gray-400 text-xs">Parceiros convidados:</span>
            <p className="text-white text-xs">{invitedPartners.length} parceiro(s)</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mini-seção 1: Informações Básicas */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-[#FF6B00]">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="group-name" className="text-white">Nome do grupo *</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Digite o nome do grupo"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="group-description" className="text-white">Descrição *</Label>
            <Textarea
              id="group-description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Digite a descrição do grupo"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="group-type" className="text-white">Tipo do Grupo *</Label>
            <Select value={groupType} onValueChange={setGroupType}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione o tipo do grupo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="Materias Basicas">Matérias Básicas</SelectItem>
                <SelectItem value="ENEM & Exames">ENEM & Exames</SelectItem>
                <SelectItem value="Interesses & Habilidades">Interesses & Habilidades</SelectItem>
                <SelectItem value="Projetos & Atividades">Projetos & Atividades</SelectItem>
                <SelectItem value="Grupos de Apoio">Grupos de Apoio</SelectItem>
                <SelectItem value="Outros">Outros...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="group-discipline" className="text-white">Disciplina/Área *</Label>
            <Input
              id="group-discipline"
              value={groupDiscipline}
              onChange={(e) => setGroupDiscipline(e.target.value)}
              placeholder="Ex.: Matemática"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="group-specific-topic" className="text-white">Tópico Específico *</Label>
            <Input
              id="group-specific-topic"
              value={groupSpecificTopic}
              onChange={(e) => setGroupSpecificTopic(e.target.value)}
              placeholder="Ex.: Álgebra Linear"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="group-tags" className="text-white">Tags</Label>
            <Input
              id="group-tags"
              value={groupTags}
              onChange={(e) => setGroupTags(e.target.value)}
              placeholder="Ex.: cálculo, matemática, exercícios (separar por vírgulas)"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mini-seção 2: Configurações */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-[#FF6B00]">Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white font-medium">Privacidade do grupo</Label>
            <RadioGroup value={groupPrivacy} onValueChange={setGroupPrivacy} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public-privacy" />
                <Label htmlFor="public-privacy" className="text-white">Público</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private-privacy" />
                <Label htmlFor="private-privacy" className="text-white">Privado</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white font-medium">Visibilidade do grupo</Label>
            <RadioGroup value={groupVisibility} onValueChange={setGroupVisibility} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="group-visibility-all" />
                <Label htmlFor="group-visibility-all" className="text-white">Permitir que todos vejam</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partners" id="group-visibility-partners" />
                <Label htmlFor="group-visibility-partners" className="text-white">Permitir que meus Parceiros vejam</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Participantes com depuração melhorada */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-[#FF6B00]">Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Convidar Participantes
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pesquise e convide seus parceiros para o grupo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    console.log('🔍 Termo de pesquisa alterado:', e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  placeholder="Pesquisar Parceiros"
                  className="pl-9 bg-gray-600 border-gray-500 text-white"
                />
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-2">
                {isLoading ? (
                  <p className="text-gray-400 text-sm text-center py-4">Carregando parceiros...</p>
                ) : filteredPartners.length > 0 ? (
                  filteredPartners.map((partner, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                      <span className="text-white text-sm">
                        {partner.profiles?.display_name || partner.profiles?.full_name || 'Nome não disponível'}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleInvitePartner(partner.parceiro_id)}
                        className={isPartnerInvited(partner.parceiro_id) ? 
                          "bg-green-600 hover:bg-green-700 text-white" : 
                          "bg-[#FF6B00] hover:bg-[#FF8C40] text-white"}
                      >
                        {isPartnerInvited(partner.parceiro_id) ? "Convidado" : "Convidar"}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">
                      {searchQuery ? 'Nenhum parceiro corresponde à pesquisa.' : 'Nenhum parceiro encontrado.'}
                    </p>
                    {!searchQuery && partners.length === 0 && (
                      <p className="text-gray-500 text-xs mt-2">
                        Adicione parceiros na página de Perfil para poder convidá-los.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Mini-seção 4: Imagem do Grupo */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-[#FF6B00]">Prévia do Grupo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-sm">Prévia do Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              {renderGroupPreview()}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              onClick={onCancel}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              Criar Grupo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGroupForm;
