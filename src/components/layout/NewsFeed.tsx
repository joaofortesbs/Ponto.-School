import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronRight } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  type: "course" | "feature" | "event";
  image: string;
  timeAgo: string;
}

const defaultNews: NewsItem[] = [
  {
    id: "1",
    title: "Nova Funcionalidade: Mentor IA Aprimorado",
    type: "feature",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    timeAgo: "1 hora atrás",
  },
  {
    id: "2",
    title: "Novo Curso: Física Quântica para Iniciantes",
    type: "course",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    timeAgo: "3 horas atrás",
  },
  {
    id: "3",
    title: "Grupo de Estudos: Matemática Avançada",
    type: "event",
    image: "https://images.unsplash.com/photo-1596496181848-3091d4878b24",
    timeAgo: "5 horas atrás",
  },
];

interface NewsFeedProps {
  news?: NewsItem[];
  isCollapsed?: boolean;
}

const NewsFeed = ({
  news = defaultNews,
  isCollapsed = false,
}: NewsFeedProps) => {
  if (isCollapsed) return null;

  return (
    <div className="px-4 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Novidades</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Ver todas
        </Button>
      </div>

      <ScrollArea className="h-[280px] pr-4 -mr-4">
        <div className="space-y-3">
          {news.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full p-0 h-auto hover:bg-accent/50 group"
            >
              <div className="flex gap-3 p-2 w-full">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge
                    className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px]"
                    variant={
                      item.type === "feature"
                        ? "default"
                        : item.type === "course"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {item.type === "feature"
                      ? "Novo"
                      : item.type === "course"
                        ? "Curso"
                        : "Evento"}
                  </Badge>
                </div>

                <div className="flex-1 flex flex-col items-start gap-1 min-w-0">
                  <p className="text-sm font-medium text-left text-foreground line-clamp-2 group-hover:text-brand-primary transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {item.timeAgo}
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NewsFeed;
