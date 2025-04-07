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
  image?: string;
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
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  },
  {
    id: "2",
    title: "Webinar gratuito: Matemática para o ENEM",
    excerpt:
      "Participe do nosso webinar gratuito e aprenda as principais técnicas para resolver questões de matemática do ENEM.",
    date: "Amanhã",
    author: "Prof. Carlos Santos",
    category: "Eventos",
    image:
      "https://images.unsplash.com/photo-1596496181871-9681eacf9764?w=800&q=80",
  },
  {
    id: "3",
    title: "Atualização da plataforma: novos recursos",
    excerpt:
      "Confira as novidades da nossa última atualização, incluindo melhorias na interface e novas ferramentas de estudo.",
    date: "3 dias atrás",
    author: "Equipe de Desenvolvimento",
    category: "Plataforma",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
];

interface NewsFeedCardProps {
  news?: NewsItem[];
}

const NewsFeedCard = ({ news = defaultNews }: NewsFeedCardProps) => {
  return (
    <Card className="w-full bg-white dark:bg-[#001427]/20 border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] dark:from-[#FF6B00] dark:to-[#29335C] text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20 shadow-md">
            <Newspaper className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <span className="relative">
                Novidades
                <span className="absolute -top-1 -right-2 h-2 w-2 bg-white rounded-full animate-pulse"></span>
              </span>
            </CardTitle>
            <p className="text-sm text-white/90 font-medium">
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
              className="hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5 transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row gap-4 p-4">
                {item.image && (
                  <div className="w-full md:w-1/4 h-48 md:h-32 overflow-hidden rounded-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#001427] dark:text-white text-lg group-hover:text-[#FF6B00] dark:group-hover:text-[#FF9B50] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF9B50] font-medium border border-[#FF6B00]/20 dark:border-[#FF6B00]/30">
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
                      className="h-8 gap-1 text-xs text-[#FF6B00] hover:text-white hover:bg-[#FF6B00] dark:text-[#FF9B50] dark:hover:text-white dark:hover:bg-[#FF6B00] transition-all duration-300"
                    >
                      Ler mais <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-[#E0E1DD] dark:border-[#E0E1DD]/20 bg-gradient-to-r from-[#FF6B00]/5 to-transparent dark:from-[#FF6B00]/10">
          <Button
            variant="ghost"
            className="w-full justify-between text-[#FF6B00] hover:text-white hover:bg-[#FF6B00] dark:text-[#FF9B50] dark:hover:text-white dark:hover:bg-[#FF6B00] font-medium transition-all duration-300"
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
