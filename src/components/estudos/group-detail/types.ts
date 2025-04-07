export interface Material {
  id: number;
  title: string;
  description: string;
  type: "document" | "video" | "exercise" | "interactive" | "quiz";
  topic: number;
  difficulty: "Básico" | "Intermediário" | "Avançado";
  author: string;
  uploadedAt: string;
  views: number;
  downloads?: number;
  duration?: string;
  questions?: number;
  relevanceScore: number;
  tags: string[];
}
