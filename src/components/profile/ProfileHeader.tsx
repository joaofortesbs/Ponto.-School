import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AboutMe from './AboutMe';
import Skills from './Skills';
import Education from './Education';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user-profile';
import { Edit2, Share2, MessagesSquare, Bell, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


export default function ProfileHeader() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("Usuário");
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // Função para buscar o perfil do usuário logado
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // Primeiro verificar se há uma sessão ativa
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          console.log('Usuário não autenticado');
          setLoading(false);
          return;
        }

        // Buscar perfil do usuário usando o email da sessão
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', sessionData.session.user.email)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setProfile(data);

          // Determinar o primeiro nome a partir do full_name, se disponível
          if (data.full_name) {
            const firstName = data.full_name.split(' ')[0];
            setFirstName(firstName);
            localStorage.setItem('userFirstName', firstName);
          } 
          // Se não tiver full_name, usar display_name como fallback
          else if (data.display_name) {
            setFirstName(data.display_name);
            localStorage.setItem('userFirstName', data.display_name);
          }

          // Definir o username
          setUsername(data.username || data.email || "");
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        setLoading(false);
      }
    };

    // Verificar no localStorage primeiro (para rápida renderização)
    const storedFirstName = localStorage.getItem('userFirstName');
    if (storedFirstName) {
      setFirstName(storedFirstName);
    }

    // Buscar dados atualizados
    fetchUserProfile();

    // Escutar por mudanças no nome do usuário
    const handleNameUpdate = (event: CustomEvent) => {
      if (event.detail?.firstName) {
        setFirstName(event.detail.firstName);
      }
    };

    document.addEventListener('userFirstNameUpdated', handleNameUpdate as EventListener);

    return () => {
      document.removeEventListener('userFirstNameUpdated', handleNameUpdate as EventListener);
    };
  }, []);

  return (
    <Card className="w-full overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm mb-6">
      {/* Background image cover */}
      <div className="h-40 w-full bg-gradient-to-r from-amber-400 to-orange-500 relative">
        {profile?.cover_url && (
          <img 
            src={profile.cover_url} 
            alt="Profile cover" 
            className="w-full h-full object-cover" 
          />
        )}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button variant="outline" size="sm" className="bg-white/30 backdrop-blur-sm border-white/20 text-white hover:bg-white/40">
            <Edit2 className="h-4 w-4 mr-1" />
            Editar Perfil
          </Button>
          <Button variant="outline" size="sm" className="bg-white/30 backdrop-blur-sm border-white/20 text-white hover:bg-white/40">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar - positioned to overlay the cover image */}
          <div className="flex justify-between items-end -mt-12 mb-4">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-950 shadow-md">
              <AvatarImage src={profile?.avatar_url || ''} alt="Profile picture" />
              <AvatarFallback className="text-2xl bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                {firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-gray-600 dark:text-gray-300">
                <MessagesSquare className="h-4 w-4 mr-1" />
                Mensagem
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 dark:text-gray-300">
                <Bell className="h-4 w-4 mr-1" />
                Notificar
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            </div>
          </div>

          {/* User info */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "Carregando..." : firstName}
              </h2>
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {profile?.plan_type === 'premium' ? 'Premium' : profile?.plan_type === 'full' ? 'Full' : 'Lite'}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              @{username || "usuario"}
            </p>
            <p className="text-gray-600 dark:text-gray-300 pt-1">
              {profile?.bio || "Sem informações adicionais"}
            </p>
          </div>
        </div>

        {/* Tabs for different profile sections */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid grid-cols-4 w-full rounded-none border-b border-gray-200 dark:border-gray-800 bg-transparent">
            <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none">
              Sobre
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none">
              Habilidades
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none">
              Formação
            </TabsTrigger>
            <TabsTrigger value="interests" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none">
              Interesses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="p-6">
            <AboutMe profile={profile} />
          </TabsContent>

          <TabsContent value="skills" className="p-6">
            <Skills />
          </TabsContent>

          <TabsContent value="education" className="p-6">
            <Education profile={profile} />
          </TabsContent>

          <TabsContent value="interests" className="p-6">
            <div className="text-gray-500 dark:text-gray-400">
              Os interesses do usuário serão exibidos aqui.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}