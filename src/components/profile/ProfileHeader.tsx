import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AddFriendsModal } from "@/components/friends/AddFriendsModal";
import {
  UserPlus,
  Settings,
  Edit,
  Save,
  X,
  Star,
  Award,
  Trophy,
  Target,
  Zap,
  Heart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Crown,
  Check,
  MessageSquare,
  MoreHorizontal,
  Camera,
  Upload,
  AlertCircle
} from "lucide-react";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick?: () => void;
}

export default function ProfileHeader({ userProfile, onEditClick }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("Carregando...");
  const [usernameToDisplay, setUsernameToDisplay] = useState("...");
  const [achievements, setAchievements] = useState([]);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAddFriendsModalOpen, setIsAddFriendsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState({
    username: '',
    display_name: '',
    full_name: '',
    bio: '',
    location: '',
    birth_date: '',
    phone: '',
    email: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("Nenhum usuário autenticado encontrado.");
          return;
        }

        // Buscar o perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError);
          return;
        }

        if (profileData) {
          // Atualizar o estado local com os dados do perfil
          setTempValues({
            username: profileData.username || '',
            display_name: profileData.display_name || '',
            full_name: profileData.full_name || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            birth_date: profileData.birth_date || '',
            phone: profileData.phone || '',
            email: profileData.email || user.email || ''
          });

          // Obter o nome de usuário para exibição - este é o mesmo nome que aparece no cabeçalho
          const profileUsername = userProfile?.username || '';
          
          // Obter o nome para a parte principal da exibição
          let displayedName = '';
          
          // Prioridade de exibição: username > display_name > full_name > fallback
          if (profileUsername) {
            displayedName = profileUsername;
          } else if (userProfile?.display_name) {
            displayedName = userProfile.display_name;
          } else if (userProfile?.full_name) {
            // Se tiver nome completo, usar o primeiro nome
            displayedName = userProfile.full_name.split(' ')[0];
          } else {
            displayedName = "Usuário";
          }
          
          // Buscar username do localStorage (mesmo usado no cabeçalho)
          const storedUsername = localStorage.getItem('username');
          
          console.log("Dados do perfil para exibição de username:", {
            profileUsername: profileUsername,
            storedUsername: storedUsername,
            displayedName: displayedName,
            profile_username: userProfile?.username,
            profile_display_name: userProfile?.display_name,
            profile_full_name: userProfile?.full_name
          });

          // Usar o nome de usuário do localStorage com fallback (prioridade máxima)
          const usernameToDisplay = storedUsername || profileUsername || 'joaofortes';

          // Atualizar os estados com os dados obtidos
          setDisplayName(displayedName);
          setUsernameToDisplay(usernameToDisplay);
          setProfilePictureURL(profileData.avatar_url || null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };

    fetchProfileData();
  }, [userProfile]);

  const handleEditClick = (field: string) => {
    setEditingField(field);
  };

  const handleSaveClick = async (field: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("Nenhum usuário autenticado encontrado.");
        return;
      }

      const updates: { [key: string]: any } = {};
      updates[field] = tempValues[field as keyof typeof tempValues];

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        console.error("Erro ao atualizar o perfil:", error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Houve um problema ao atualizar o perfil. Tente novamente.",
        });
        return;
      }

      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso.",
      });

      setEditingField(null);
    } catch (error) {
      console.error("Erro ao salvar as alterações:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Houve um problema ao salvar as alterações. Tente novamente.",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTempValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewProfilePicture(file);
      setProfilePictureURL(URL.createObjectURL(file));
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!newProfilePicture) {
      toast({
        variant: "destructive",
        title: "Nenhuma imagem selecionada",
        description: "Por favor, selecione uma imagem para fazer o upload.",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      const fileExt = newProfilePicture.name.split(".").pop();
      const filePath = `avatars/${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, newProfilePicture, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Erro ao fazer upload da imagem:", uploadError);
        throw uploadError;
      }

      const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicURL })
        .eq("id", user.id);

      if (updateError) {
        console.error("Erro ao atualizar o perfil com a URL da imagem:", updateError);
        throw updateError;
      }

      setProfilePictureURL(publicURL);
      toast({
        title: "Foto de perfil atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao fazer upload e atualizar a foto de perfil:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar foto de perfil",
        description: "Houve um problema ao atualizar sua foto de perfil. Tente novamente.",
      });
    } finally {
      setUploading(false);
      setIsProfilePictureModalOpen(false);
    }
  };

  return (
    <>
      <Card className="w-full bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm">
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-[#FF6B00] to-[#FF8B3A] relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-[#0A2540] shadow-lg">
                <AvatarImage src={userProfile?.avatar_url} alt={displayName} />
                <AvatarFallback className="bg-[#FF6B00] text-white text-xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-3 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-white/90 dark:bg-[#0A2540]/90 backdrop-blur-sm"
                  onClick={() => setIsAddFriendsModalOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Adicionar Amigos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-white/90 dark:bg-[#0A2540]/90 backdrop-blur-sm"
                  onClick={() => setIsAccountModalOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {displayName}
                </h1>
                <p className="text-[#64748B] dark:text-white/60">
                  @{usernameToDisplay}
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-[#64748B] dark:text-white/60">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Crown className="h-4 w-4 text-[#FF6B00]" />
                    <span className="font-medium">{userProfile?.level || 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{userProfile?.rank || "Aprendiz"}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Badge variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20">
                  <Award className="h-3 w-3 mr-1" />
                  {achievements.length} Conquistas
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <Trophy className="h-3 w-3 mr-1" />
                  Master em Matemática
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de Configurações da Conta */}
      <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Configurações da Conta</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="perfil" className="w-full">
            <TabsList className="bg-transparent">
              <TabsTrigger value="perfil" className="px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]">
                Perfil
              </TabsTrigger>
              <TabsTrigger value="seguranca" className="px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]">
                Segurança
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="perfil" className="pt-6 focus:outline-none">
              <ScrollArea className="h-[400px] w-full">
                <div className="grid gap-4">
                  {/* Avatar */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium leading-none">Foto de Perfil</h4>
                      <p className="text-sm text-muted-foreground">
                        Atualize sua foto de perfil.
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setIsProfilePictureModalOpen(true)}>
                      Alterar
                    </Button>
                  </div>

                  {/* Nome de Usuário */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="username">Nome de Usuário</Label>
                      <Input
                        id="username"
                        value={tempValues.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        disabled={editingField !== "username"}
                      />
                    </div>
                    {editingField === "username" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => handleSaveClick("username")}>
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="link" size="sm" className="p-0" onClick={() => handleEditClick("username")}>
                        Editar nome de usuário
                      </Button>
                    )}
                  </div>

                  {/* Nome de Exibição */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="displayName">Nome de Exibição</Label>
                      <Input
                        id="displayName"
                        value={tempValues.display_name}
                        onChange={(e) => handleInputChange("display_name", e.target.value)}
                        disabled={editingField !== "display_name"}
                      />
                    </div>
                    {editingField === "display_name" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => handleSaveClick("display_name")}>
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="link" size="sm" className="p-0" onClick={() => handleEditClick("display_name")}>
                        Editar nome de exibição
                      </Button>
                    )}
                  </div>

                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={tempValues.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        disabled={editingField !== "full_name"}
                      />
                    </div>
                    {editingField === "full_name" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => handleSaveClick("full_name")}>
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="link" size="sm" className="p-0" onClick={() => handleEditClick("full_name")}>
                        Editar nome completo
                      </Button>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Escreva uma breve descrição sobre você"
                        value={tempValues.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        disabled={editingField !== "bio"}
                      />
                    </div>
                    {editingField === "bio" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => handleSaveClick("bio")}>
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="link" size="sm" className="p-0" onClick={() => handleEditClick("bio")}>
                        Editar bio
                      </Button>
                    )}
                  </div>

                  {/* Localização */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={tempValues.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        disabled={editingField !== "location"}
                      />
                    </div>
                    {editingField === "location" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => handleSaveClick("location")}>
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="link" size="sm" className="p-0" onClick={() => handleEditClick("location")}>
                        Editar localização
                      </Button>
                    )}
                  </div>

                  {/* Data de Nascimento */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={tempValues.birth_date}
                        onChange={(e) => handleInputChange("birth_date", e.target.value)}
                        disabled={editingField !== "birth_date"}
                      />
                    </div>
                    {editingField === "birth_date" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => handleSaveClick("birth_date")}>
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="link" size="sm" className="p-0" onClick={() => handleEditClick("birth_date")}>
                        Editar data de nascimento
                      </Button>
                    )}
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={tempValues.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={editingField !== "phone"}
                      />
                    </div>
                    {editingField === "phone" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => handleSaveClick("phone")}>
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="link" size="sm" className="p-0" onClick={() => handleEditClick("phone")}>
                        Editar telefone
                      </Button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={tempValues.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="seguranca" className="pt-6 focus:outline-none">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">Alterar Senha</h4>
                    <p className="text-sm text-muted-foreground">
                      Altere sua senha para manter sua conta segura.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Alterar Senha
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">Autenticação de Dois Fatores</h4>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança à sua conta.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Ativar
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de Alterar Foto de Perfil */}
      <Dialog open={isProfilePictureModalOpen} onOpenChange={setIsProfilePictureModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Alterar Foto de Perfil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center">
              <Avatar className="h-32 w-32">
                {profilePictureURL ? (
                  <AvatarImage src={profilePictureURL} alt="Nova foto de perfil" />
                ) : (
                  <AvatarFallback className="bg-[#FF6B00] text-white text-xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-4 h-4 mr-2" />
                Selecionar Imagem
              </Button>
              <Input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
                ref={fileInputRef}
              />
              {newProfilePicture && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setNewProfilePicture(null);
                  setProfilePictureURL(userProfile?.avatar_url || null);
                }}>
                  <X className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUploadProfilePicture} disabled={uploading}>
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Amigos - NOVA IMPLEMENTAÇÃO */}
      <AddFriendsModal 
        isOpen={isAddFriendsModalOpen} 
        onClose={() => setIsAddFriendsModalOpen(false)} 
      />
    </>
  );
}
