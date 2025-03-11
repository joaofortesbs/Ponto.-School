import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Settings,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  MessageSquare,
  Clock,
  ChevronRight,
  Star,
  Zap,
  Trophy,
  Bookmark,
  Heart,
  Share2,
  BarChart3,
  CheckCircle,
  Users,
  Briefcase,
  GraduationCap,
  Globe,
  Camera,
  Upload,
  Pencil,
  Lock,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Download,
  Printer,
  ExternalLink,
  MoreHorizontal,
  Wallet,
  Gift,
  Sparkles,
  Diamond,
} from "lucide-react";

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

export default function ProfilePage({ isOwnProfile = true }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState("perfil");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Profile Info */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm">
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-[#29335C] to-[#001427]"></div>
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0A2540] overflow-hidden bg-white dark:bg-[#0A2540]">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center hover:bg-[#FF6B00]/90 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                  João Silva
                </h2>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Diamond className="h-4 w-4 text-[#FF6B00]" />
                  <span className="text-sm text-[#FF6B00] font-medium">
                    Plano Premium
                  </span>
                </div>
                <p className="text-[#64748B] dark:text-white/60 text-sm mt-2">
                  Estudante de Engenharia de Software
                </p>

                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#29335C] dark:text-white">
                      15
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Nível
                    </p>
                  </div>
                  <div className="h-10 border-r border-[#E0E1DD] dark:border-white/10"></div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#29335C] dark:text-white">
                      8
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Turmas
                    </p>
                  </div>
                  <div className="h-10 border-r border-[#E0E1DD] dark:border-white/10"></div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#29335C] dark:text-white">
                      12
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Conquistas
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#64748B] dark:text-white/60">
                      Progresso para o próximo nível
                    </span>
                    <span className="text-xs font-medium text-[#FF6B00]">
                      72%
                    </span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>

                <div className="mt-6 flex gap-2">
                  <Button className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    <Edit className="h-4 w-4 mr-2" /> Editar Perfil
                  </Button>
                  <Button
                    variant="outline"
                    className="w-10 h-10 p-0 border-[#E0E1DD] dark:border-white/10"
                  >
                    <Share2 className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                  Informações de Contato
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Email
                    </p>
                    <p className="text-sm font-medium text-[#29335C] dark:text-white">
                      joao.silva@email.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Telefone
                    </p>
                    <p className="text-sm font-medium text-[#29335C] dark:text-white">
                      (11) 98765-4321
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Localização
                    </p>
                    <p className="text-sm font-medium text-[#29335C] dark:text-white">
                      São Paulo, SP - Brasil
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Data de Nascimento
                    </p>
                    <p className="text-sm font-medium text-[#29335C] dark:text-white">
                      15 de Março de 1998
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges & Achievements */}
            <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                  Conquistas
                </h3>
                <Button
                  variant="ghost"
                  className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
                >
                  Ver Todas <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-2">
                    <Trophy className="h-7 w-7 text-[#FF6B00]" />
                  </div>
                  <p className="text-xs text-center text-[#29335C] dark:text-white font-medium">
                    Mestre em Matemática
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-2">
                    <Zap className="h-7 w-7 text-[#FF6B00]" />
                  </div>
                  <p className="text-xs text-center text-[#29335C] dark:text-white font-medium">
                    Estudante Dedicado
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-2">
                    <Award className="h-7 w-7 text-[#FF6B00]" />
                  </div>
                  <p className="text-xs text-center text-[#29335C] dark:text-white font-medium">
                    Colaborador Premium
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs Content */}
          <div className="w-full md:w-2/3">
            <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="border-b border-[#E0E1DD] dark:border-white/10">
                  <TabsList className="p-0 bg-transparent h-auto">
                    <TabsTrigger
                      value="perfil"
                      className="px-6 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]"
                    >
                      Perfil
                    </TabsTrigger>
                    <TabsTrigger
                      value="atividades"
                      className="px-6 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]"
                    >
                      Atividades
                    </TabsTrigger>
                    <TabsTrigger
                      value="turmas"
                      className="px-6 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]"
                    >
                      Turmas
                    </TabsTrigger>
                    <TabsTrigger
                      value="configuracoes"
                      className="px-6 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]"
                    >
                      Configurações
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[calc(100vh-300px)]">
                  <TabsContent
                    value="perfil"
                    className="p-6 focus:outline-none"
                  >
                    <div className="space-y-6">
                      {/* About Me */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                            Sobre Mim
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            {isEditing ? (
                              <Save className="h-4 w-4" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {isEditing ? (
                          <Textarea
                            className="min-h-[120px] border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                            defaultValue="Olá! Sou estudante de Engenharia de Software na Universidade de São Paulo. Apaixonado por tecnologia, programação e matemática. Busco constantemente novos conhecimentos e desafios para aprimorar minhas habilidades. Nas horas vagas, gosto de jogar xadrez, ler livros de ficção científica e praticar esportes."
                          />
                        ) : (
                          <p className="text-[#64748B] dark:text-white/80">
                            Olá! Sou estudante de Engenharia de Software na
                            Universidade de São Paulo. Apaixonado por
                            tecnologia, programação e matemática. Busco
                            constantemente novos conhecimentos e desafios para
                            aprimorar minhas habilidades. Nas horas vagas, gosto
                            de jogar xadrez, ler livros de ficção científica e
                            praticar esportes.
                          </p>
                        )}
                      </div>

                      {/* Education */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                            Educação
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="h-6 w-6 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="text-base font-medium text-[#29335C] dark:text-white">
                                Universidade de São Paulo
                              </h4>
                              <p className="text-sm text-[#64748B] dark:text-white/60">
                                Bacharelado em Engenharia de Software
                              </p>
                              <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                                2020 - Presente
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="text-base font-medium text-[#29335C] dark:text-white">
                                Colégio Técnico de São Paulo
                              </h4>
                              <p className="text-sm text-[#64748B] dark:text-white/60">
                                Técnico em Desenvolvimento de Sistemas
                              </p>
                              <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                                2017 - 2019
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                            Habilidades
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-[#29335C] dark:text-white">
                                Programação
                              </span>
                              <span className="text-xs text-[#FF6B00]">
                                Avançado
                              </span>
                            </div>
                            <Progress value={90} className="h-2 bg-gray-200" />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-[#29335C] dark:text-white">
                                Matemática
                              </span>
                              <span className="text-xs text-[#FF6B00]">
                                Avançado
                              </span>
                            </div>
                            <Progress value={85} className="h-2 bg-gray-200" />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-[#29335C] dark:text-white">
                                Física
                              </span>
                              <span className="text-xs text-[#FF6B00]">
                                Intermediário
                              </span>
                            </div>
                            <Progress value={75} className="h-2 bg-gray-200" />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-[#29335C] dark:text-white">
                                Química
                              </span>
                              <span className="text-xs text-[#FF6B00]">
                                Intermediário
                              </span>
                            </div>
                            <Progress value={70} className="h-2 bg-gray-200" />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                            JavaScript
                          </Badge>
                          <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                            Python
                          </Badge>
                          <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                            React
                          </Badge>
                          <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                            Node.js
                          </Badge>
                          <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                            SQL
                          </Badge>
                          <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                            Git
                          </Badge>
                          <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                            Docker
                          </Badge>
                          <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                            AWS
                          </Badge>
                        </div>
                      </div>

                      {/* Interests */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                            Interesses
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
                            Programação
                          </Badge>
                          <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
                            Inteligência Artificial
                          </Badge>
                          <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
                            Matemática
                          </Badge>
                          <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
                            Física Quântica
                          </Badge>
                          <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
                            Xadrez
                          </Badge>
                          <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
                            Ficção Científica
                          </Badge>
                          <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
                            Astronomia
                          </Badge>
                          <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20">
                            Música
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="atividades"
                    className="p-6 focus:outline-none"
                  >
                    <div className="space-y-6">
                      {/* Recent Activity */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                            Atividades Recentes
                          </h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                            >
                              <Filter className="h-3 w-3 mr-1" /> Filtrar
                            </Button>
                            <Button
                              variant="ghost"
                              className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
                            >
                              Ver Todas <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {[
                            {
                              type: "lesson",
                              title: "Completou a aula de Cálculo Diferencial",
                              time: "Hoje, 10:30",
                              icon: (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ),
                            },
                            {
                              type: "comment",
                              title:
                                "Comentou na discussão sobre Física Quântica",
                              time: "Ontem, 15:45",
                              icon: (
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                              ),
                            },
                            {
                              type: "achievement",
                              title:
                                "Conquistou o troféu 'Mestre em Matemática'",
                              time: "3 dias atrás",
                              icon: (
                                <Trophy className="h-5 w-5 text-[#FF6B00]" />
                              ),
                            },
                            {
                              type: "join",
                              title: "Entrou na turma de Física Avançada",
                              time: "1 semana atrás",
                              icon: (
                                <Users className="h-5 w-5 text-purple-500" />
                              ),
                            },
                          ].map((activity, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-[#f7f9fa] dark:bg-[#0A2540]/50 rounded-lg"
                            >
                              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#29335C]/50 flex items-center justify-center flex-shrink-0">
                                {activity.icon}
                              </div>
                              <div className="flex-1">
                                <p className="text-[#29335C] dark:text-white">
                                  {activity.title}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3 text-[#64748B] dark:text-white/60" />
                                  <span className="text-xs text-[#64748B] dark:text-white/60">
                                    {activity.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Study Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                            Progresso de Estudos
                          </h3>
                          <Button
                            variant="ghost"
                            className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
                          >
                            Ver Detalhes <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-[#0A2540] p-4 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                            <h4 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
                              Disciplinas
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-[#29335C] dark:text-white">
                                    Matemática
                                  </span>
                                  <span className="text-xs text-[#FF6B00]">
                                    85%
                                  </span>
                                </div>
                                <Progress
                                  value={85}
                                  className="h-2 bg-gray-200"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-[#29335C] dark:text-white">
                                    Física
                                  </span>
                                  <span className="text-xs text-[#FF6B00]">
                                    72%
                                  </span>
                                </div>
                                <Progress
                                  value={72}
                                  className="h-2 bg-gray-200"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-[#29335C] dark:text-white">
                                    Química
                                  </span>
                                  <span className="text-xs text-[#FF6B00]">
                                    63%
                                  </span>
                                </div>
                                <Progress
                                  value={63}
                                  className="h-2 bg-gray-200"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-[#29335C] dark:text-white">
                                    Biologia
                                  </span>
                                  <span className="text-xs text-[#FF6B00]">
                                    78%
                                  </span>
                                </div>
                                <Progress
                                  value={78}
                                  className="h-2 bg-gray-200"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-[#0A2540] p-4 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                            <h4 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
                              Tempo de Estudo
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-2 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-[#FF6B00]" />
                                  <span className="text-sm text-[#29335C] dark:text-white">
                                    Esta semana
                                  </span>
                                </div>
                                <span className="text-[#FF6B00] font-medium">
                                  12h 30min
                                </span>
                              </div>

                              <div className="flex justify-between items-center p-2 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                                  <span className="text-sm text-[#29335C] dark:text-white">
                                    Semana passada
                                  </span>
                                </div>
                                <span className="text-[#64748B] dark:text-white/60">
                                  10h 45min
                                </span>
                              </div>

                              <div className="flex justify-between items-center p-2 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                                  <span className="text-sm text-[#29335C] dark:text-white">
                                    Este mês
                                  </span>
                                </div>
                                <span className="text-[#64748B] dark:text-white/60">
                                  42h 15min
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Saved Content */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                            Conteúdos Salvos
                          </h3>
                          <Button
                            variant="ghost"
                            className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
                          >
                            Ver Todos <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              title: "Introdução à Física Quântica",
                              type: "Artigo",
                              date: "Salvo em 22/06/2024",
                              icon: (
                                <FileText className="h-5 w-5 text-[#FF6B00]" />
                              ),
                            },
                            {
                              title: "Cálculo Diferencial e Integral",
                              type: "Vídeo",
                              date: "Salvo em 20/06/2024",
                              icon: (
                                <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                              ),
                            },
                          ].map((content, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10"
                            >
                              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                                {content.icon}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-[#29335C] dark:text-white font-medium">
                                  {content.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white text-xs">
                                    {content.type}
                                  </Badge>
                                  <span className="text-xs text-[#64748B] dark:text-white/60">
                                    {content.date}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="turmas"
                    className="p-6 focus:outline-none"
                  >
                    <div className="space-y-6">
                      {/* My Classes */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                            Minhas Turmas
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 h-4 w-4" />
                              <Input
                                placeholder="Buscar turmas..."
                                className="pl-9 h-8 text-sm border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 w-60"
                              />
                            </div>
                            <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white h-8 text-sm">
                              <Plus className="h-4 w-4 mr-1" /> Nova Turma
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              name: "Matemática Avançada",
                              teacher: "Prof. Carlos Oliveira",
                              students: 28,
                              progress: 85,
                              nextClass: "Hoje, 14:00",
                            },
                            {
                              name: "Física Quântica",
                              teacher: "Profa. Ana Souza",
                              students: 22,
                              progress: 72,
                              nextClass: "Amanhã, 10:30",
                            },
                            {
                              name: "Química Orgânica",
                              teacher: "Prof. Roberto Santos",
                              students: 25,
                              progress: 63,
                              nextClass: "Quinta, 16:00",
                            },
                            {
                              name: "Biologia Molecular",
                              teacher: "Profa. Mariana Lima",
                              students: 30,
                              progress: 78,
                              nextClass: "Sexta, 08:30",
                            },
                          ].map((course, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-[#FF6B00]/30 cursor-pointer"
                            >
                              <div className="h-3 bg-[#FF6B00]"></div>
                              <div className="p-4">
                                <h4 className="text-[#29335C] dark:text-white font-bold">
                                  {course.name}
                                </h4>
                                <p className="text-sm text-[#64748B] dark:text-white/60">
                                  {course.teacher}
                                </p>

                                <div className="flex items-center gap-2 mt-3">
                                  <Users className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                                  <span className="text-xs text-[#64748B] dark:text-white/60">
                                    {course.students} alunos
                                  </span>
                                </div>

                                <div className="mt-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-[#64748B] dark:text-white/60">
                                      Progresso
                                    </span>
                                    <span className="text-xs text-[#FF6B00]">
                                      {course.progress}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={course.progress}
                                    className="h-1.5 bg-gray-200"
                                  />
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-[#FF6B00]" />
                                    <span className="text-xs text-[#FF6B00]">
                                      {course.nextClass}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    className="h-7 text-xs text-[#FF6B00] hover:bg-[#FF6B00]/10 p-0 px-2"
                                  >
                                    Ver Detalhes
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Classes */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                            Turmas Recomendadas
                          </h3>
                          <Button
                            variant="ghost"
                            className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
                          >
                            Ver Todas <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {[
                            {
                              name: "Inteligência Artificial",
                              teacher: "Prof. Lucas Mendes",
                              students: 35,
                              rating: 4.8,
                            },
                            {
                              name: "Astronomia Básica",
                              teacher: "Prof. Felipe Costa",
                              students: 42,
                              rating: 4.7,
                            },
                          ].map((course, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                                  <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                                </div>
                                <div>
                                  <h4 className="text-[#29335C] dark:text-white font-medium">
                                    {course.name}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-[#64748B] dark:text-white/60">
                                      {course.teacher}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3 text-[#64748B] dark:text-white/60" />
                                      <span className="text-xs text-[#64748B] dark:text-white/60">
                                        {course.students}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-[#FF6B00]" />
                                      <span className="text-xs text-[#FF6B00]">
                                        {course.rating}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button className="h-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs">
                                Participar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="configuracoes"
                    className="p-6 focus:outline-none"
                  >
                    <div className="space-y-6">
                      {/* Account Settings */}
                      <div>
                        <div
                          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
                          onClick={() => toggleSection("account")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="text-[#29335C] dark:text-white font-medium">
                                Informações da Conta
                              </h4>
                              <p className="text-xs text-[#64748B] dark:text-white/60">
                                Gerencie suas informações pessoais
                              </p>
                            </div>
                          </div>
                          {expandedSection === "account" ? (
                            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          )}
                        </div>

                        {expandedSection === "account" && (
                          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
                            <div className="space-y-4">
                              <div>
                                <label
                                  htmlFor="name"
                                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                                >
                                  Nome Completo
                                </label>
                                <Input
                                  id="name"
                                  defaultValue="João Silva"
                                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="email"
                                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                                >
                                  Email
                                </label>
                                <Input
                                  id="email"
                                  type="email"
                                  defaultValue="joao.silva@email.com"
                                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="phone"
                                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                                >
                                  Telefone
                                </label>
                                <Input
                                  id="phone"
                                  defaultValue="(11) 98765-4321"
                                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="location"
                                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                                >
                                  Localização
                                </label>
                                <Input
                                  id="location"
                                  defaultValue="São Paulo, SP - Brasil"
                                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="bio"
                                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                                >
                                  Biografia
                                </label>
                                <Textarea
                                  id="bio"
                                  className="min-h-[100px] border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                                  defaultValue="Olá! Sou estudante de Engenharia de Software na Universidade de São Paulo. Apaixonado por tecnologia, programação e matemática."
                                />
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                                >
                                  Cancelar
                                </Button>
                                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                                  Salvar Alterações
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Security Settings */}
                      <div>
                        <div
                          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
                          onClick={() => toggleSection("security")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                              <Lock className="h-5 w-5 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="text-[#29335C] dark:text-white font-medium">
                                Segurança
                              </h4>
                              <p className="text-xs text-[#64748B] dark:text-white/60">
                                Gerencie sua senha e segurança da conta
                              </p>
                            </div>
                          </div>
                          {expandedSection === "security" ? (
                            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          )}
                        </div>

                        {expandedSection === "security" && (
                          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
                            <div className="space-y-4">
                              <div>
                                <label
                                  htmlFor="current-password"
                                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                                >
                                  Senha Atual
                                </label>
                                <div className="relative">
                                  <Input
                                    id="current-password"
                                    type={showPassword ? "text" : "password"}
                                    className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 pr-10"
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 hover:text-[#29335C] dark:hover:text-white"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor="new-password"
                                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                                >
                                  Nova Senha
                                </label>
                                <div className="relative">
                                  <Input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 pr-10"
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 hover:text-[#29335C] dark:hover:text-white"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor="confirm-password"
                                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                                >
                                  Confirmar Nova Senha
                                </label>
                                <div className="relative">
                                  <Input
                                    id="confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 pr-10"
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 hover:text-[#29335C] dark:hover:text-white"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="pt-2">
                                <h5 className="text-sm font-medium text-[#29335C] dark:text-white mb-2">
                                  Autenticação de Dois Fatores
                                </h5>
                                <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-[#FF6B00]" />
                                    <div>
                                      <p className="text-sm text-[#29335C] dark:text-white">
                                        Autenticação de Dois Fatores
                                      </p>
                                      <p className="text-xs text-[#64748B] dark:text-white/60">
                                        Adicione uma camada extra de segurança
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    className="h-8 text-xs border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                                  >
                                    Configurar
                                  </Button>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                                >
                                  Cancelar
                                </Button>
                                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                                  Salvar Alterações
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notification Settings */}
                      <div>
                        <div
                          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
                          onClick={() => toggleSection("notifications")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                              <Bell className="h-5 w-5 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="text-[#29335C] dark:text-white font-medium">
                                Notificações
                              </h4>
                              <p className="text-xs text-[#64748B] dark:text-white/60">
                                Gerencie suas preferências de notificação
                              </p>
                            </div>
                          </div>
                          {expandedSection === "notifications" ? (
                            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          )}
                        </div>

                        {expandedSection === "notifications" && (
                          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                <div>
                                  <p className="text-sm text-[#29335C] dark:text-white">
                                    Notificações por Email
                                  </p>
                                  <p className="text-xs text-[#64748B] dark:text-white/60">
                                    Receba atualizações por email
                                  </p>
                                </div>
                                <div className="flex items-center h-6 w-11 rounded-full bg-[#FF6B00] p-1 cursor-pointer">
                                  <div className="h-4 w-4 rounded-full bg-white transform translate-x-5"></div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                <div>
                                  <p className="text-sm text-[#29335C] dark:text-white">
                                    Notificações no Navegador
                                  </p>
                                  <p className="text-xs text-[#64748B] dark:text-white/60">
                                    Receba notificações no navegador
                                  </p>
                                </div>
                                <div className="flex items-center h-6 w-11 rounded-full bg-[#FF6B00] p-1 cursor-pointer">
                                  <div className="h-4 w-4 rounded-full bg-white transform translate-x-5"></div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                <div>
                                  <p className="text-sm text-[#29335C] dark:text-white">
                                    Notificações de Mensagens
                                  </p>
                                  <p className="text-xs text-[#64748B] dark:text-white/60">
                                    Receba notificações de novas mensagens
                                  </p>
                                </div>
                                <div className="flex items-center h-6 w-11 rounded-full bg-[#FF6B00] p-1 cursor-pointer">
                                  <div className="h-4 w-4 rounded-full bg-white transform translate-x-5"></div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                <div>
                                  <p className="text-sm text-[#29335C] dark:text-white">
                                    Notificações de Turmas
                                  </p>
                                  <p className="text-xs text-[#64748B] dark:text-white/60">
                                    Receba atualizações sobre suas turmas
                                  </p>
                                </div>
                                <div className="flex items-center h-6 w-11 rounded-full bg-[#FF6B00] p-1 cursor-pointer">
                                  <div className="h-4 w-4 rounded-full bg-white transform translate-x-5"></div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                                >
                                  Cancelar
                                </Button>
                                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                                  Salvar Alterações
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Settings */}
                      <div>
                        <div
                          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
                          onClick={() => toggleSection("payment")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="text-[#29335C] dark:text-white font-medium">
                                Pagamento e Assinatura
                              </h4>
                              <p className="text-xs text-[#64748B] dark:text-white/60">
                                Gerencie seus métodos de pagamento e assinatura
                              </p>
                            </div>
                          </div>
                          {expandedSection === "payment" ? (
                            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          )}
                        </div>

                        {expandedSection === "payment" && (
                          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
                            <div className="space-y-4">
                              <div className="p-4 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Diamond className="h-5 w-5 text-[#FF6B00]" />
                                    <h5 className="text-base font-medium text-[#29335C] dark:text-white">
                                      Plano Premium
                                    </h5>
                                  </div>
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Ativo
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                  <p className="text-sm text-[#64748B] dark:text-white/60">
                                    Próxima cobrança
                                  </p>
                                  <p className="text-sm text-[#29335C] dark:text-white">
                                    15/07/2024
                                  </p>
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-[#64748B] dark:text-white/60">
                                    Valor mensal
                                  </p>
                                  <p className="text-sm font-medium text-[#FF6B00]">
                                    R$ 49,90
                                  </p>
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <Button
                                    variant="outline"
                                    className="text-xs h-8 border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                                  >
                                    Cancelar Assinatura
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <h5 className="text-sm font-medium text-[#29335C] dark:text-white mb-2">
                                  Métodos de Pagamento
                                </h5>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                        VISA
                                      </div>
                                      <div>
                                        <p className="text-sm text-[#29335C] dark:text-white">
                                          •••• •••• •••• 4242
                                        </p>
                                        <p className="text-xs text-[#64748B] dark:text-white/60">
                                          Expira em 12/25
                                        </p>
                                      </div>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                      Padrão
                                    </Badge>
                                  </div>

                                  <Button
                                    variant="outline"
                                    className="w-full border-dashed border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60 hover:border-[#FF6B00]/30 hover:text-[#FF6B00]"
                                  >
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar
                                    Método de Pagamento
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <h5 className="text-sm font-medium text-[#29335C] dark:text-white mb-2">
                                  Histórico de Pagamentos
                                </h5>
                                <div className="space-y-3">
                                  {[
                                    {
                                      date: "15/06/2024",
                                      amount: "R$ 49,90",
                                      status: "Pago",
                                    },
                                    {
                                      date: "15/05/2024",
                                      amount: "R$ 49,90",
                                      status: "Pago",
                                    },
                                    {
                                      date: "15/04/2024",
                                      amount: "R$ 49,90",
                                      status: "Pago",
                                    },
                                  ].map((payment, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Wallet className="h-5 w-5 text-[#FF6B00]" />
                                        <div>
                                          <p className="text-sm text-[#29335C] dark:text-white">
                                            Assinatura Premium
                                          </p>
                                          <p className="text-xs text-[#64748B] dark:text-white/60">
                                            {payment.date}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium text-[#29335C] dark:text-white">
                                          {payment.amount}
                                        </p>
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                          {payment.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Help & Support */}
                      <div>
                        <div
                          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
                          onClick={() => toggleSection("help")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                              <HelpCircle className="h-5 w-5 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="text-[#29335C] dark:text-white font-medium">
                                Ajuda e Suporte
                              </h4>
                              <p className="text-xs text-[#64748B] dark:text-white/60">
                                Obtenha ajuda e suporte
                              </p>
                            </div>
                          </div>
                          {expandedSection === "help" ? (
                            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
                          )}
                        </div>

                        {expandedSection === "help" && (
                          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg cursor-pointer hover:bg-[#f7f9fa]/70 dark:hover:bg-[#29335C]/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <MessageSquare className="h-5 w-5 text-[#FF6B00]" />
                                  <div>
                                    <p className="text-sm text-[#29335C] dark:text-white">
                                      Central de Ajuda
                                    </p>
                                    <p className="text-xs text-[#64748B] dark:text-white/60">
                                      Encontre respostas para suas perguntas
                                    </p>
                                  </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                              </div>

                              <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg cursor-pointer hover:bg-[#f7f9fa]/70 dark:hover:bg-[#29335C]/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <MessageSquare className="h-5 w-5 text-[#FF6B00]" />
                                  <div>
                                    <p className="text-sm text-[#29335C] dark:text-white">
                                      Contato com Suporte
                                    </p>
                                    <p className="text-xs text-[#64748B] dark:text-white/60">
                                      Entre em contato com nossa equipe
                                    </p>
                                  </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                              </div>

                              <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg cursor-pointer hover:bg-[#f7f9fa]/70 dark:hover:bg-[#29335C]/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-[#FF6B00]" />
                                  <div>
                                    <p className="text-sm text-[#29335C] dark:text-white">
                                      Termos de Serviço
                                    </p>
                                    <p className="text-xs text-[#64748B] dark:text-white/60">
                                      Leia nossos termos de serviço
                                    </p>
                                  </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                              </div>

                              <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg cursor-pointer hover:bg-[#f7f9fa]/70 dark:hover:bg-[#29335C]/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-[#FF6B00]" />
                                  <div>
                                    <p className="text-sm text-[#29335C] dark:text-white">
                                      Política de Privacidade
                                    </p>
                                    <p className="text-xs text-[#64748B] dark:text-white/60">
                                      Leia nossa política de privacidade
                                    </p>
                                  </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Logout Button */}
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                          <LogOut className="h-4 w-4 mr-2" /> Sair da Conta
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
