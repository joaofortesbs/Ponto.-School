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

  // Carregar parceiros
  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: partnersData, error } = await supabase
        .from('parceiros')
        .select(`
          parceiro_id,
          profiles!parceiros_parceiro_id_fkey (
            display_name,
            full_name
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

  // Filtrar parceiros com base na pesquisa
  const filteredPartners = partners.filter(partner => {
    const name = partner.profiles?.display_name || partner.profiles?.full_name || 'Nome não disponível';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Função para lidar com mudanças no tipo de grupo (corrigida)
  const handleGroupTypeChange = (value: string) => {
    console.log('Mudança no tipo de grupo detectada. Valor:', value, 'Stack:', new Error().stack);
    setGroupType(value);
    
    // Resetar visibilidade quando o tipo muda
    if (value === "Materias Basicas" || value === "ENEM & Exames") {
      setGroupVisibility("all");
    } else {
      setGroupVisibility("partners");
    }
    
    console.log('Tipo de grupo atualizado para:', value);
  };

  const handleSubmit = () => {
    if (!groupName || !groupDescription || !groupType || !groupDiscipline || !groupSpecificTopic) {
      alert('Por favor, preencha todos os campos obrigatórios.');
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
      is_visible_to_partners: groupVisibility === "partners"
    };

    console.log('Dados do formulário sendo enviados:', formData);
    onSubmit(formData);
  };

  // Função segura para renderizar campos condicionais baseados no tipo
  const renderConditionalFields = () => {
    if (!groupType) return null;

    console.log('Renderizando campos condicionais para tipo:', groupType);

    return (
      <Card className="bg-gray-700 border-gray-600 mt-4">
        <CardHeader>
          <CardTitle className="text-white text-sm">Configurações Específicas</CardTitle>
          <CardDescription className="text-gray-400">
            Configurações baseadas no tipo de grupo selecionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(groupType === "Materias Basicas" || groupType === "ENEM & Exames") && (
            <div>
              <Label className="text-white font-medium">Visibilidade Acadêmica</Label>
              <RadioGroup value={groupVisibility} onValueChange={setGroupVisibility} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="academic-visibility-all" />
                  <Label htmlFor="academic-visibility-all" className="text-white">
                    Visível para todos os estudantes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partners" id="academic-visibility-partners" />
                  <Label htmlFor="academic-visibility-partners" className="text-white">
                    Apenas meus parceiros de estudo
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          {(groupType === "Interesses & Habilidades" || groupType === "Projetos & Atividades") && (
            <div>
              <Label className="text-white font-medium">Visibilidade de Projeto</Label>
              <RadioGroup value={groupVisibility} onValueChange={setGroupVisibility} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partners" id="project-visibility-partners" />
                  <Label htmlFor="project-visibility-partners" className="text-white">
                    Apenas parceiros selecionados
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="project-visibility-all" />
                  <Label htmlFor="project-visibility-all" className="text-white">
                    Aberto para interessados
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {groupType === "Grupos de Apoio" && (
            <div>
              <Label className="text-white font-medium">Privacidade do Grupo de Apoio</Label>
              <RadioGroup value={groupVisibility} onValueChange={setGroupVisibility} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partners" id="support-visibility-partners" />
                  <Label htmlFor="support-visibility-partners" className="text-white">
                    Privado - apenas convidados
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Função segura para renderizar prévia do grupo
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
            <Select value={groupType} onValueChange={handleGroupTypeChange}>
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

          {/* Renderizar campos condicionais baseados no tipo */}
          {renderConditionalFields()}
        </CardContent>
      </Card>

      {/* Mini-seção 3: Participantes */}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar Parceiros"
                  className="pl-9 bg-gray-600 border-gray-500 text-white"
                />
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-2">
                {filteredPartners.length > 0 ? (
                  filteredPartners.map((partner, index) => (
                    <div key={`partner-${partner.parceiro_id}-${index}`} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                      <span className="text-white text-sm">
                        {partner.profiles?.display_name || partner.profiles?.full_name || 'Nome não disponível'}
                      </span>
                      <Button 
                        size="sm" 
                        disabled 
                        className="bg-gray-500 text-gray-300 cursor-not-allowed"
                      >
                        Convidar
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">
                    {partners.length === 0 ? 'Nenhum parceiro encontrado.' : 'Nenhum parceiro corresponde à pesquisa.'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Mini-seção 4: Imagem do Grupo */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-[#FF6B00]">Imagem do Grupo</CardTitle>
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
