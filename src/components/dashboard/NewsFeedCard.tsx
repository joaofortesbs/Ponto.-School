import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ChevronRight, Calendar, User } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
}

const defaultNews: NewsItem[] = [
  {
    id: "1",
    title: "Novos cursos de Física Quântica disponíveis",
    excerpt:
      "Amplie seus conhecimentos com nossos novos cursos avançados de Física Quântica, ministrados pelos melhores professores do país.",
    date: "Hoje",
    author: "Equipe Acadêmica",
    category: "Novos Cursos",
  },
  {
    id: "2",
    title: "Webinar gratuito: Matemática para o ENEM",
    excerpt:
      "Participe do nosso webinar gratuito e aprenda as principais técnicas para resolver questões de matemática do ENEM.",
    date: "Amanhã",
    author: "Prof. Carlos Santos",
    category: "Eventos",
  },
  {
    id: "3",
    title: "Atualização da plataforma: novos recursos",
    excerpt:
      "Confira as novidades da nossa última atualização, incluindo melhorias na interface e novas ferramentas de estudo.",
    date: "3 dias atrás",
    author: "Equipe de Desenvolvimento",
    category: "Plataforma",
  },
];

interface NewsFeedCardProps {
  news?: NewsItem[];
}

const NewsFeedCard = ({ news = defaultNews }: NewsFeedCardProps) => {
  return (
    <Card className="w-full bg-white dark:bg-[#001427]/20 border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#E0E1DD]/20">
            <Newspaper className="h-5 w-5 text-[#001427] dark:text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-[#001427] dark:text-white">
              Novidades
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fique por dentro das últimas atualizações
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#E0E1DD] dark:divide-[#E0E1DD]/20">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-[#001427] dark:text-white">
                  {item.title}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white">
                  {item.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {item.excerpt}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.author}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs text-[#29335C] hover:bg-[#29335C]/10 dark:text-[#778DA9] dark:hover:bg-[#778DA9]/10"
                >
                  Ler mais <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-[#E0E1DD] dark:border-[#E0E1DD]/20">
          <Button
            variant="ghost"
            className="w-full justify-between text-[#29335C] hover:text-[#29335C] hover:bg-[#29335C]/10 dark:text-[#778DA9] dark:hover:text-[#778DA9] dark:hover:bg-[#778DA9]/10"
          >
            <span>Ver todas as novidades</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsFeedCard;
