import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import {
  BookOpen,
  GraduationCap,
  LineChart,
  Circle,
  BookIcon,
  FileText,
  Video,
  LucideHeadphones,
  Brain,
  ChevronRight,
  Settings,
  Calculator,
  FileQuestion,
  Bell,
  User,
  MonitorPlay,
  Clock,
  Calendar,
  Library,
  Users,
  BarChart3,
  PencilRuler,
  History
} from "lucide-react";

interface AtalhoProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  className?: string;
  id: string; // Adicionado ID único para cada atalho
}

// Lista inicial de atalhos
const atalhosIniciais: AtalhoProps[] = [
  {
    id: "biblioteca",
    icon: <BookOpen className="h-8 w-8 text-blue-500" />,
    title: "Biblioteca",
    description: "Acesse materiais de estudo",
    href: "/biblioteca",
    className: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800",
  },
  {
    id: "turmas",
    icon: <GraduationCap className="h-8 w-8 text-purple-500" />,
    title: "Turmas",
    description: "Gerencie suas classes",
    href: "/turmas",
    className: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-800",
  },
  {
    id: "epictus-ia",
    icon: <Brain className="h-8 w-8 text-orange-500" />,
    title: "Epictus IA",
    description: "Assistente inteligente",
    href: "/epictus-ia",
    className: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/20 border-orange-200 dark:border-orange-800",
  },
  {
    id: "organizacao",
    icon: <LineChart className="h-8 w-8 text-emerald-500" />,
    title: "Organização",
    description: "Veja seu progresso",
    href: "/organizacao",
    className: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "lembretes",
    icon: <Bell className="h-8 w-8 text-pink-500" />,
    title: "Lembretes",
    description: "Gerenciar lembretes",
    href: "/lembretes",
    className: "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/20 border-pink-200 dark:border-pink-800",
  },
  {
    id: "grupos-estudo",
    icon: <Users className="h-8 w-8 text-indigo-500" />,
    title: "Grupos de Estudo",
    description: "Estude em grupo",
    href: "/turmas/grupos",
    className: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800",
  },
  {
    id: "agenda",
    icon: <Calendar className="h-8 w-8 text-teal-500" />,
    title: "Agenda",
    description: "Veja sua agenda",
    href: "/agenda",
    className: "bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/40 dark:to-teal-900/20 border-teal-200 dark:border-teal-800",
  },
  {
    id: "planos-estudo",
    icon: <PencilRuler className="h-8 w-8 text-amber-500" />,
    title: "Planos de Estudo",
    description: "Crie planos de estudo",
    href: "/planos-estudo",
    className: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800",
  },
];

export default function AtalhoSchoolCard() {
  const { isLightMode } = useTheme();
  const [atalhos, setAtalhos] = useState<AtalhoProps[]>(() => {
    // Recuperar do localStorage se existir
    const savedAtalhos = localStorage.getItem('userAtalhos');
    return savedAtalhos ? JSON.parse(savedAtalhos) : atalhosIniciais;
  });

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPersonalizando, setIsPersonalizando] = useState(false);

  // Salvar no localStorage sempre que a ordem mudar
  useEffect(() => {
    // Salvando apenas os dados serializáveis, removendo qualquer referência DOM
    const serializableAtalhos = atalhos.map(atalho => ({
      id: atalho.id,
      title: atalho.title,
      description: atalho.description,
      href: atalho.href,
      className: atalho.className,
      // Não incluímos o icon aqui, será reconstruído ao carregar
    }));

    try {
      localStorage.setItem('userAtalhos', JSON.stringify(serializableAtalhos));
    } catch (error) {
      console.error("Erro ao salvar atalhos:", error);
    }
  }, [atalhos]);

  // Reconstruir a lista completa de atalhos a partir dos dados salvos
  useEffect(() => {
    const savedAtalhos = localStorage.getItem('userAtalhos');
    if (savedAtalhos) {
      try {
        const parsedAtalhos = JSON.parse(savedAtalhos);
        // Reconstruir a lista completa com os ícones
        const reconstruidos = parsedAtalhos.map((saved: any) => {
          // Encontrar o atalho original para pegar o ícone
          const original = atalhosIniciais.find(a => a.id === saved.id);
          return {
            ...saved,
            icon: original?.icon || <Circle className="h-8 w-8 text-gray-500" />,
          };
        });
        setAtalhos(reconstruidos);
      } catch (error) {
        console.error("Erro ao carregar atalhos:", error);
      }
    }
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (!isPersonalizando) return;
    setDraggedItem(id);
    setIsDragging(true);
    // Usar o dataTransfer para armazenar apenas o ID como string, evitando estruturas circulares
    e.dataTransfer.setData("text/plain", id);

    // Definir um efeito de arrasto
    if (e.currentTarget.style) {
      e.currentTarget.style.opacity = "0.4";
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (e.currentTarget.style) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    return false;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();

    if (!isPersonalizando || !draggedItem) return;

    const draggedItemId = e.dataTransfer.getData("text/plain");

    // Se o alvo for o mesmo que o item arrastado, não faz nada
    if (draggedItemId === targetId) return;

    // Cria uma cópia do array de atalhos
    const atalhosCopy = [...atalhos];

    // Encontra os índices dos itens de origem e destino
    const draggedIndex = atalhosCopy.findIndex(item => item.id === draggedItemId);
    const targetIndex = atalhosCopy.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove o item arrastado do array
    const [draggedAtalho] = atalhosCopy.splice(draggedIndex, 1);

    // Insere o item na nova posição
    atalhosCopy.splice(targetIndex, 0, draggedAtalho);

    // Atualiza o estado com a nova ordenação
    setAtalhos(atalhosCopy);
    setDraggedItem(null);
  };

  const togglePersonalizacao = () => {
    setIsPersonalizando(!isPersonalizando);
  };

  return (
    <Card className="h-[600px] overflow-hidden relative">
      <CardHeader className={`pb-2 border-b ${
      isLightMode 
        ? 'bg-gradient-to-r from-amber-100 via-orange-100 to-amber-50 shadow-sm' 
        : 'bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-amber-900/20 shadow-md'
      }`}>
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Atalhos School</span>
          <Button 
            variant="link" 
            className="p-0 h-auto text-sm font-normal" 
            onClick={togglePersonalizacao}
            style={{ marginTop: "0px" }}>
            <Settings className="h-4 w-4 mr-1" />
            {isPersonalizando ? "Concluir" : "Personalizar Atalhos"}
          </Button>
        </CardTitle>
        <CardDescription>
          {isPersonalizando 
            ? "Arraste os cards para reordená-los" 
            : "Acesso rápido às ferramentas"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-2 gap-4 h-full overflow-y-auto">
        {atalhos.map((atalho) => (
          <div
            key={atalho.id}
            draggable={isPersonalizando}
            onDragStart={(e) => handleDragStart(e, atalho.id)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, atalho.id)}
            className={cn(
              "flex flex-col h-[120px] p-4 rounded-lg border transition-all",
              isPersonalizando 
                ? "cursor-move hover:shadow-lg border-dashed" 
                : "hover:shadow-md",
              isDragging && draggedItem === atalho.id 
                ? "opacity-40" 
                : "opacity-100",
              atalho.className
            )}
          >
            {isPersonalizando ? (
              <>
                <div className="mb-2">{atalho.icon}</div>
                <h3 className="font-medium">{atalho.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {atalho.description}
                </p>
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center rounded-lg">
                  <span className="text-xs font-medium">Arraste para reordenar</span>
                </div>
              </>
            ) : (
              <a
                href={atalho.href}
                className="flex flex-col h-full"
                onClick={(e) => isPersonalizando && e.preventDefault()}
              >
                <div className="mb-2">{atalho.icon}</div>
                <h3 className="font-medium">{atalho.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {atalho.description}
                </p>
              </a>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}