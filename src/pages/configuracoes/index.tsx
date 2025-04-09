import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Palette,
  LogOut,
  Mail,
  Lock,
  Edit,
  Upload,
  Trash,
} from "lucide-react";

export default function ConfiguracoesPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [language, setLanguage] = useState("pt-BR");

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
            Configurações
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Gerencie suas preferências e dados da conta
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 space-y-4">
          <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 border-4 border-white dark:border-[#0A2540]">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-white dark:bg-[#0A2540] border border-[#E0E1DD] dark:border-white/10 h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                  João Silva
                </h2>
                <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
                  joao.silva@email.com
                </p>
                <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
                  Nível 15 - Especialista
                </p>
                <Button variant="outline" className="mt-4 w-full gap-2">
                  <User className="h-4 w-4" /> Ver Perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden">
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 py-2 px-3 text-[#29335C] dark:text-white"
              >
                <User className="h-4 w-4" /> Perfil
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 py-2 px-3 text-[#29335C] dark:text-white"
              >
                <Bell className="h-4 w-4" /> Notificações
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 py-2 px-3 text-[#29335C] dark:text-white"
              >
                <Shield className="h-4 w-4" /> Segurança
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 py-2 px-3 text-[#29335C] dark:text-white"
              >
                <Globe className="h-4 w-4" /> Idioma e Região
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 py-2 px-3 text-[#29335C] dark:text-white"
              >
                <Palette className="h-4 w-4" /> Aparência
              </Button>
            </div>
            <div className="border-t border-[#E0E1DD] dark:border-white/10 p-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 py-2 px-3 text-red-500"
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    localStorage.removeItem('auth_status');
                    localStorage.removeItem('auth_checked');
                    window.dispatchEvent(new Event('logout'));
                    window.location.href = "/login";
                  } catch (error) {
                    console.error("Erro ao realizar logout:", error);
                  }
                }}
              >
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/4 space-y-6">
          <Tabs defaultValue="perfil">
            <TabsList className="mb-6">
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança</TabsTrigger>
              <TabsTrigger value="aparencia">Aparência</TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="space-y-6">
              <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription className="text-[#64748B] dark:text-white/60">
                    Atualize suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input id="firstName" defaultValue="João" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input id="lastName" defaultValue="Silva" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="joao.silva@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        defaultValue="(11) 98765-4321"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
                        defaultValue="Estudante de Engenharia apaixonado por matemática e física."
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
                    Foto de Perfil
                  </CardTitle>
                  <CardDescription className="text-[#64748B] dark:text-white/60">
                    Atualize sua foto de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="w-24 h-24 border-4 border-white dark:border-[#0A2540]">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="gap-2">
                          <Upload className="h-4 w-4" /> Enviar Foto
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2 text-red-500"
                        >
                          <Trash className="h-4 w-4" /> Remover
                        </Button>
                      </div>
                      <p className="text-sm text-[#64748B] dark:text-white/60">
                        Formatos permitidos: JPG, PNG. Tamanho máximo: 2MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notificacoes" className="space-y-6">
              <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
                    Preferências de Notificações
                  </CardTitle>
                  <CardDescription className="text-[#64748B] dark:text-white/60">
                    Gerencie como você recebe notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-[#29335C] dark:text-white">
                      Email
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-marketing">
                            Novidades e promoções
                          </Label>
                          <p className="text-xs text-[#64748B] dark:text-white/60">
                            Receba informações sobre novos cursos e ofertas
                            especiais
                          </p>
                        </div>
                        <Switch
                          id="email-marketing"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-updates">
                            Atualizações de curso
                          </Label>
                          <p className="text-xs text-[#64748B] dark:text-white/60">
                            Receba notificações sobre atualizações nos seus
                            cursos
                          </p>
                        </div>
                        <Switch
                          id="email-updates"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-reminders">Lembretes</Label>
                          <p className="text-xs text-[#64748B] dark:text-white/60">
                            Receba lembretes sobre prazos e eventos
                          </p>
                        </div>
                        <Switch
                          id="email-reminders"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-[#29335C] dark:text-white">
                      Push
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-all">
                            Todas as notificações
                          </Label>
                          <p className="text-xs text-[#64748B] dark:text-white/60">
                            Ativar ou desativar todas as notificações push
                          </p>
                        </div>
                        <Switch
                          id="push-all"
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-messages">Mensagens</Label>
                          <p className="text-xs text-[#64748B] dark:text-white/60">
                            Receba notificações de novas mensagens
                          </p>
                        </div>
                        <Switch
                          id="push-messages"
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-reminders">Lembretes</Label>
                          <p className="text-xs text-[#64748B] dark:text-white/60">
                            Receba lembretes sobre prazos e eventos
                          </p>
                        </div>
                        <Switch
                          id="push-reminders"
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="seguranca" className="space-y-6">
              <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
                    Alterar Senha
                  </CardTitle>
                  <CardDescription className="text-[#64748B] dark:text-white/60">
                    Atualize sua senha para manter sua conta segura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirmar Nova Senha
                    </Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Atualizar Senha
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
                    Autenticação de Dois Fatores
                  </CardTitle>
                  <CardDescription className="text-[#64748B] dark:text-white/60">
                    Adicione uma camada extra de segurança à sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">
                        Autenticação de Dois Fatores
                      </Label>
                      <p className="text-xs text-[#64748B] dark:text-white/60">
                        Proteja sua conta com um código adicional enviado para
                        seu celular
                      </p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={twoFactorAuth}
                      onCheckedChange={setTwoFactorAuth}
                    />
                  </div>
                  {twoFactorAuth && (
                    <div className="p-4 bg-[#E0E1DD]/20 dark:bg-white/5 rounded-lg">
                      <p className="text-sm text-[#29335C] dark:text-white mb-3">
                        Para configurar a autenticação de dois fatores, siga os
                        passos abaixo:
                      </p>
                      <ol className="text-sm text-[#64748B] dark:text-white/60 space-y-2 list-decimal pl-4">
                        <li>
                          Baixe um aplicativo autenticador como Google
                          Authenticator ou Authy
                        </li>
                        <li>Escaneie o código QR abaixo com o aplicativo</li>
                        <li>
                          Digite o código de 6 dígitos gerado pelo aplicativo
                        </li>
                      </ol>
                      <div className="flex justify-center my-4">
                        <div className="w-40 h-40 bg-white p-2 rounded-lg">
                          <div className="w-full h-full bg-[#E0E1DD]/50 rounded flex items-center justify-center">
                            <Lock className="h-10 w-10 text-[#29335C]" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="verification-code">
                          Código de Verificação
                        </Label>
                        <Input
                          id="verification-code"
                          placeholder="Digite o código de 6 dígitos"
                        />
                      </div>
                      <Button className="w-full mt-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                        Verificar e Ativar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aparencia" className="space-y-6">
              <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
                    Tema
                  </CardTitle>
                  <CardDescription className="text-[#64748B] dark:text-white/60">
                    Personalize a aparência da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Modo Escuro</Label>
                      <p className="text-xs text-[#64748B] dark:text-white/60">
                        Ativar ou desativar o modo escuro
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer ${!darkMode ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-[#E0E1DD] dark:border-white/10"}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-[#29335C] dark:text-white">
                          Modo Claro
                        </span>
                        <Sun className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <div className="w-full h-24 bg-white rounded border border-[#E0E1DD] overflow-hidden">
                        <div className="h-6 bg-[#F1F5F9] border-b border-[#E0E1DD] flex items-center px-2">
                          <div className="w-2 h-2 rounded-full bg-[#E0E1DD] mr-1"></div>
                          <div className="w-2 h-2 rounded-full bg-[#E0E1DD] mr-1"></div>
                          <div className="w-2 h-2 rounded-full bg-[#E0E1DD]"></div>
                        </div>
                        <div className="p-2">
                          <div className="w-full h-3 bg-[#E0E1DD] rounded mb-1"></div>
                          <div className="w-2/3 h-3 bg-[#E0E1DD] rounded"></div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-4 cursor-pointer ${darkMode ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-[#E0E1DD] dark:border-white/10"}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-[#29335C] dark:text-white">
                          Modo Escuro
                        </span>
                        <Moon className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <div className="w-full h-24 bg-[#0A2540] rounded border border-white/10 overflow-hidden">
                        <div className="h-6 bg-[#001427] border-b border-white/10 flex items-center px-2">
                          <div className="w-2 h-2 rounded-full bg-white/20 mr-1"></div>
                          <div className="w-2 h-2 rounded-full bg-white/20 mr-1"></div>
                          <div className="w-2 h-2 rounded-full bg-white/20"></div>
                        </div>
                        <div className="p-2">
                          <div className="w-full h-3 bg-white/20 rounded mb-1"></div>
                          <div className="w-2/3 h-3 bg-white/20 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
                    Idioma
                  </CardTitle>
                  <CardDescription className="text-[#64748B] dark:text-white/60">
                    Escolha o idioma da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <select
                      id="language"
                      className="w-full p-2 rounded-md border border-input bg-background"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (United States)</option>
                      <option value="es-ES">Español</option>
                      <option value="fr-FR">Français</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
