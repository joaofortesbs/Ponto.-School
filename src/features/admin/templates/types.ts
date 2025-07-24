export interface Template {
  id: string;
  name: string;
  description: string;
  tags: string[];
  ia_provider: string;
  enabled: boolean;
  fields?: Record<string, any>;
  last_generated_preview?: string;
  last_generated_at?: string;
  generation_count?: number;
  created_at: string;
  updated_at: string;
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
  id: string;
  template_id: string;
  user_id: string;
  title: string;
  content: string;
  form_data: Record<string, string>;
  status: 'generated' | 'in_construction' | 'completed' | 'sent';
  created_at: string;
  updated_at: string;
}