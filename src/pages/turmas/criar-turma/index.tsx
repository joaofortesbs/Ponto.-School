import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  ArrowLeft,
  Upload,
  Calendar,
  Clock,
  Users,
  Info,
  Save,
  Trash2,
} from "lucide-react";

export default function CriarTurmaPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("informacoes");
  const [formData, setFormData] = useState({
    nome: "",
    disciplina: "",
    descricao: "",
    professor: "",
    dataInicio: "",
    dataFim: "",
    horarios: "",
    cargaHoraria: "",
    imagem: null,
    categoria: "propria", // Marca como turma própria
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, imagem: e.target.files?.[0] || null }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para salvar a turma
    console.log("Turma criada:", formData);

    // Simular criação bem-sucedida e redirecionar
    navigate("/turmas?view=proprias");
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/turmas")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
              Criar Nova Turma
            </h1>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm font-open-sans">
              Crie sua própria turma personalizada
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#FF6B00]" />
            Nova Turma
          </CardTitle>
          <CardDescription>
            Preencha os detalhes da sua nova turma. Você poderá editá-los
            posteriormente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid grid-cols-3 gap-4 bg-transparent">
                <TabsTrigger
                  value="informacoes"
                  className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Informações Básicas
                </TabsTrigger>
                <TabsTrigger
                  value="horarios"
                  className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Datas e Horários
                </TabsTrigger>
                <TabsTrigger
                  value="imagem"
                  className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Imagem da Turma
                </TabsTrigger>
              </TabsList>

              <TabsContent value="informacoes" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Turma *</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      placeholder="Ex: Física Quântica"
                      required
                      className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disciplina">Disciplina *</Label>
                    <Input
                      id="disciplina"
                      name="disciplina"
                      value={formData.disciplina}
                      onChange={handleInputChange}
                      placeholder="Ex: Física"
                      required
                      className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professor">Professor *</Label>
                  <Input
                    id="professor"
                    name="professor"
                    value={formData.professor}
                    onChange={handleInputChange}
                    placeholder="Ex: Prof. Carlos Santos"
                    required
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição da Turma</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Descreva o conteúdo e objetivos da turma..."
                    className="min-h-[120px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  />
                </div>
              </TabsContent>

              <TabsContent value="horarios" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início *</Label>
                    <Input
                      id="dataInicio"
                      name="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={handleInputChange}
                      required
                      className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Término *</Label>
                    <Input
                      id="dataFim"
                      name="dataFim"
                      type="date"
                      value={formData.dataFim}
                      onChange={handleInputChange}
                      required
                      className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horarios">Horários das Aulas *</Label>
                  <Input
                    id="horarios"
                    name="horarios"
                    value={formData.horarios}
                    onChange={handleInputChange}
                    placeholder="Ex: Segundas e Quartas, 14:00 - 16:00"
                    required
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargaHoraria">Carga Horária Total *</Label>
                  <Input
                    id="cargaHoraria"
                    name="cargaHoraria"
                    value={formData.cargaHoraria}
                    onChange={handleInputChange}
                    placeholder="Ex: 80 horas"
                    required
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  />
                </div>
              </TabsContent>

              <TabsContent value="imagem" className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="imagem">Imagem de Capa da Turma</Label>
                  <div className="border-2 border-dashed border-[#FF6B00]/30 rounded-lg p-6 text-center hover:border-[#FF6B00]/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="imagem"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="imagem"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="h-10 w-10 text-[#FF6B00]/50" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.imagem
                          ? formData.imagem.name
                          : "Clique para fazer upload de uma imagem"}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Recomendado: 1200 x 400 pixels, máximo 2MB
                      </span>
                    </label>
                  </div>
                  {formData.imagem && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, imagem: null }))
                        }
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover imagem
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/turmas")}
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Criar Turma
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
