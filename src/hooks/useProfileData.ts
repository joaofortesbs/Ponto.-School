
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date | null;
  endDate: Date | null;
  current: boolean;
  description: string;
  grade?: string;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

interface Interest {
  id: string;
  name: string;
  category: string;
}

export const useProfileData = () => {
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar todos os dados do perfil
  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);

      // Carregar biografia
      const { data: bioData } = await supabase
        .from('user_profiles_bio')
        .select('bio')
        .eq('user_id', user.id)
        .maybeSingle();

      if (bioData) {
        setBio(bioData.bio || '');
      }

      // Carregar educação
      const { data: educationData } = await supabase
        .from('user_education')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (educationData) {
        setEducation(educationData.map(edu => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field || '',
          startDate: edu.start_date ? new Date(edu.start_date) : null,
          endDate: edu.end_date ? new Date(edu.end_date) : null,
          current: edu.current,
          description: edu.description || '',
          grade: edu.grade
        })));
      }

      // Carregar habilidades
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (skillsData) {
        setSkills(skillsData.map(skill => ({
          id: skill.id,
          name: skill.name,
          level: skill.level,
          category: skill.category
        })));
      }

      // Carregar interesses
      const { data: interestsData } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (interestsData) {
        setInterests(interestsData.map(interest => ({
          id: interest.id,
          name: interest.name,
          category: interest.category
        })));
      }

    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar biografia
  const saveBio = async (newBio: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_profiles_bio')
        .upsert({
          user_id: user.id,
          bio: newBio,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar biografia:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar biografia",
          variant: "destructive"
        });
        return false;
      }

      setBio(newBio);
      toast({
        title: "Sucesso",
        description: "Biografia salva com sucesso!"
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar biografia:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar biografia",
        variant: "destructive"
      });
      return false;
    }
  };

  // Adicionar educação
  const addEducation = async (newEducation: Omit<Education, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_education')
        .insert({
          user_id: user.id,
          institution: newEducation.institution,
          degree: newEducation.degree,
          field: newEducation.field,
          start_date: newEducation.startDate?.toISOString().split('T')[0],
          end_date: newEducation.endDate?.toISOString().split('T')[0],
          current: newEducation.current,
          description: newEducation.description,
          grade: newEducation.grade
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar educação:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar educação",
          variant: "destructive"
        });
        return false;
      }

      const educationWithId = {
        id: data.id,
        ...newEducation
      };

      setEducation(prev => [educationWithId, ...prev]);
      toast({
        title: "Sucesso",
        description: "Educação adicionada com sucesso!"
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar educação:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar educação",
        variant: "destructive"
      });
      return false;
    }
  };

  // Remover educação
  const removeEducation = async (educationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_education')
        .delete()
        .eq('id', educationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover educação:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover educação",
          variant: "destructive"
        });
        return false;
      }

      setEducation(prev => prev.filter(edu => edu.id !== educationId));
      toast({
        title: "Sucesso",
        description: "Educação removida com sucesso!"
      });
      return true;
    } catch (error) {
      console.error('Erro ao remover educação:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover educação",
        variant: "destructive"
      });
      return false;
    }
  };

  // Adicionar habilidade
  const addSkill = async (newSkill: Omit<Skill, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_skills')
        .insert({
          user_id: user.id,
          name: newSkill.name,
          level: newSkill.level,
          category: newSkill.category
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar habilidade:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar habilidade",
          variant: "destructive"
        });
        return false;
      }

      const skillWithId = {
        id: data.id,
        ...newSkill
      };

      setSkills(prev => [...prev, skillWithId]);
      toast({
        title: "Sucesso",
        description: "Habilidade adicionada com sucesso!"
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar habilidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar habilidade",
        variant: "destructive"
      });
      return false;
    }
  };

  // Remover habilidade
  const removeSkill = async (skillId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', skillId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover habilidade:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover habilidade",
          variant: "destructive"
        });
        return false;
      }

      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      toast({
        title: "Sucesso",
        description: "Habilidade removida com sucesso!"
      });
      return true;
    } catch (error) {
      console.error('Erro ao remover habilidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover habilidade",
        variant: "destructive"
      });
      return false;
    }
  };

  // Adicionar interesse
  const addInterest = async (newInterest: Omit<Interest, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_interests')
        .insert({
          user_id: user.id,
          name: newInterest.name,
          category: newInterest.category
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar interesse:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar interesse",
          variant: "destructive"
        });
        return false;
      }

      const interestWithId = {
        id: data.id,
        ...newInterest
      };

      setInterests(prev => [...prev, interestWithId]);
      toast({
        title: "Sucesso",
        description: "Interesse adicionado com sucesso!"
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar interesse:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar interesse",
        variant: "destructive"
      });
      return false;
    }
  };

  // Remover interesse
  const removeInterest = async (interestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('id', interestId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover interesse:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover interesse",
          variant: "destructive"
        });
        return false;
      }

      setInterests(prev => prev.filter(interest => interest.id !== interestId));
      toast({
        title: "Sucesso",
        description: "Interesse removido com sucesso!"
      });
      return true;
    } catch (error) {
      console.error('Erro ao remover interesse:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover interesse",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  return {
    bio,
    education,
    skills,
    interests,
    loading,
    saveBio,
    addEducation,
    removeEducation,
    addSkill,
    removeSkill,
    addInterest,
    removeInterest,
    refetch: loadProfileData
  };
};
