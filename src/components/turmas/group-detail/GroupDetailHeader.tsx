import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  Settings,
  UserPlus,
  Share2,
  Heart,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GroupDetailHeaderProps {
  group: any;
  onBack: () => void;
}

const GroupDetailHeader: React.FC<GroupDetailHeaderProps> = ({
  group,
  onBack,
}) => {
  const [membersCount, setMembersCount] = useState<number>(0);

  useEffect(() => {
    const fetchMembersCount = async () => {
      if (!group?.id) return;

      try {
        const { data, error } = await supabase
          .from('membros_grupos')
          .select('user_id', { count: 'exact' })
          .eq('grupo_id', group.id);

        if (error) {
          console.error('Erro ao buscar quantidade de membros:', error);
          return;
        }

        setMembersCount(data?.length || 0);
      } catch (error) {
        console.error('Erro ao buscar membros do grupo:', error);
      }
    };

    fetchMembersCount();
  }, [group?.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-secondary/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <UserPlus className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-2xl">{group.nome}</h1>
          <Badge variant="secondary">
            {group.is_private ? "Privado" : "Público"}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {group.descricao}
        </p>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Criado por{" "}
            <span className="font-medium text-gray-800 dark:text-gray-100">
              {group.criador_nome}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            {group.disciplina ? (
              <>
                <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                <span>{group.disciplina}</span>
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 text-[#FF6B00]" />
                <span>{group.area}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 text-[#FF6B00]" />
            <span>{membersCount} {membersCount === 1 ? 'membro' : 'membros'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupDetailHeader;