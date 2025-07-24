export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'facil' | 'medio' | 'dificil';
  apiType: 'gemini' | 'openai' | 'claude';
  enabled: boolean;
  prompt: string;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateFilters {
  category?: string;
  difficulty?: string;
  enabled?: boolean;
  search?: string;
}

export interface TemplateFormData {
  name: string;
  status: 'draft' | 'published';
  ia_provider: string;
  fields: Record<string, any>;
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface GeneratedActivity {
  title: string;
  description: string;
  content: any;
  difficulty: string;
  duration: number;
  type: string;
}