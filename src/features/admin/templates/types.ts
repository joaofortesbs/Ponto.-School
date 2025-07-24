
export interface Template {
  id: string;
  name: string;
  status: 'draft' | 'published';
  ia_provider: string;
  fields: Record<string, any>;
  last_generated_preview: Record<string, any>;
  created_at?: string;
  updated_at?: string;
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
