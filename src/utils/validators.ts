
import { z } from 'zod';

export const messageValidationSchema = z.object({
  message: z.string()
    .min(4, 'Mensagem deve ter pelo menos 4 caracteres')
    .refine(
      (msg) => msg.trim().split(' ').length >= 3,
      'Mensagem deve conter pelo menos 3 palavras'
    )
});

export const contextValidationSchema = z.object({
  content: z.array(z.string()).min(1, 'Pelo menos um conteúdo deve ser selecionado'),
  materials: z.array(z.string()).min(1, 'Pelo menos um tipo de material deve ser selecionado'),
  dates: z.array(z.string()).min(1, 'Pelo menos uma data importante deve ser definida'),
  restrictions: z.array(z.string()).optional()
});

export const dateValidationSchema = z.object({
  date: z.string().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    },
    'Data deve ser válida e futura'
  )
});

export type MessageValidation = z.infer<typeof messageValidationSchema>;
export type ContextValidation = z.infer<typeof contextValidationSchema>;
export type DateValidation = z.infer<typeof dateValidationSchema>;

export const validateMessage = (message: string): { isValid: boolean; errors: string[] } => {
  try {
    messageValidationSchema.parse({ message });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: error.errors.map(e => e.message) };
    }
    return { isValid: false, errors: ['Erro de validação desconhecido'] };
  }
};

export const validateContext = (context: any): { isValid: boolean; errors: string[] } => {
  try {
    contextValidationSchema.parse(context);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: error.errors.map(e => e.message) };
    }
    return { isValid: false, errors: ['Erro de validação desconhecido'] };
  }
};
